"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  apiClient,
  ApiError,
  AUTH_EXPIRED_EVENT,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/lib/api-client";
import type { AuthResponse, UserResponse } from "@/lib/types";

const ME_QUERY_KEY = ["auth", "me"] as const;

async function fetchCurrentUser(): Promise<UserResponse | null> {
  if (!getAuthToken()) return null;
  try {
    return await apiClient.get<UserResponse>("/api/auth/me");
  } catch (error) {
    // 401은 JwtAuthenticationFilter가 유효하지 않은 토큰을 이미 걸러낸 것이라 로그아웃 상태로 취급한다.
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

interface AuthContextValue {
  user: UserResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  exchangeOAuthCode: (code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: Infinity,
    retry: false,
  });

  // FR-A10, 인수 14: 401을 받으면 토큰은 이미 삭제된 상태로 이 이벤트가 온다. 캐시만 비우고,
  // "/login으로 이동 + 만료 안내 표시"는 AuthGuard 한 곳에서만 한다(중복 리다이렉트 경합 방지).
  useEffect(() => {
    function handleAuthExpired() {
      queryClient.setQueryData(ME_QUERY_KEY, null);
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, [queryClient]);

  const applyAuthResponse = useCallback(
    (response: AuthResponse) => {
      setAuthToken(response.token);
      const nextUser: UserResponse = {
        id: response.userId,
        email: response.email,
        name: response.name,
        role: response.role,
      };
      queryClient.setQueryData(ME_QUERY_KEY, nextUser);
    },
    [queryClient],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiClient.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      });
      applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      const response = await apiClient.post<AuthResponse>("/api/auth/signup", {
        email,
        password,
        name,
      });
      applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const exchangeOAuthCode = useCallback(
    async (code: string) => {
      const response = await apiClient.post<AuthResponse>("/api/auth/oauth/exchange", { code });
      applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const logout = useCallback(() => {
    clearAuthToken();
    // AuthGuard가 user===null을 감지해 /login으로 보낸다(만료 플래그가 없으니 안내 없이 이동).
    queryClient.setQueryData(ME_QUERY_KEY, null);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isLoading,
      login,
      signup,
      exchangeOAuthCode,
      logout,
    }),
    [user, isLoading, login, signup, exchangeOAuthCode, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return context;
}
