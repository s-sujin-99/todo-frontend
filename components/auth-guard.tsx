"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { consumeAuthExpiredFlag } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/loading-state";

/**
 * localStorage는 서버에서 읽을 수 없고 Next.js 16의 proxy.ts도 이를 대체하지 못해, 보호 화면 가드는
 * 클라이언트 전용이다(ROADMAP Phase 6 주의). 인증 판정이 끝나기 전에는 항상 로딩 상태를 보여줘
 * 로그인 화면이 번쩍이는 것을 막는다.
 *
 * "/login으로 보내는 결정"은 이 컴포넌트 하나만 한다 — useAuth의 401 이벤트 리스너가 별도로
 * 리다이렉트까지 하면 두 이펙트가 경합해 나중에 실행되는 쪽이 ?expired=1을 지워버린다(인수 14).
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || user) return;
    const expired = consumeAuthExpiredFlag();
    router.replace(expired ? "/login?expired=1" : "/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <LoadingState />;
  }

  return <>{children}</>;
}
