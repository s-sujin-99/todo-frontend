"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient, toErrorMessage } from "@/lib/api-client";
import type {
  AdminStatsResponse,
  AdminTodoResponse,
  AdminUserResponse,
  PageResponse,
} from "@/lib/types";

const PAGE_SIZE = 10;

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiClient.get<AdminStatsResponse>("/api/admin/stats"),
  });
}

// FR-M04: 이메일 검색어가 있으면 부분 일치로 서버에서 좁혀 받는다.
export function useAdminUsers(email: string, page: number) {
  return useQuery({
    queryKey: ["admin", "users", email, page],
    queryFn: () =>
      apiClient.get<PageResponse<AdminUserResponse>>(
        `/api/admin/users?page=${page}&size=${PAGE_SIZE}${
          email ? `&email=${encodeURIComponent(email)}` : ""
        }`,
      ),
    placeholderData: keepPreviousData,
  });
}

// FR-M05: 계정 활성/비활성 전환. 통계 카드의 활성 사용자 수도 함께 갱신한다.
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      apiClient.patch<AdminUserResponse>(`/api/admin/users/${id}/status`, { enabled }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (error: unknown) => {
      toast.error(toErrorMessage(error));
    },
  });
}

export function useAdminTodos(page: number) {
  return useQuery({
    queryKey: ["admin", "todos", page],
    queryFn: () =>
      apiClient.get<PageResponse<AdminTodoResponse>>(
        `/api/admin/todos?page=${page}&size=${PAGE_SIZE}`,
      ),
    placeholderData: keepPreviousData,
  });
}
