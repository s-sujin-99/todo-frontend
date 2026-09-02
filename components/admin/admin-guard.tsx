"use client";

import type { ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";
import { AccessDenied } from "@/components/admin/access-denied";

/**
 * FR-M10: AuthGuard(로그인 여부)를 통과한 뒤 role까지 확인한다. 이 컴포넌트는 화면 편의일 뿐이며
 * 실제 차단은 서버의 SecurityConfig·@PreAuthorize(FR-M02)가 담당한다.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (user?.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
