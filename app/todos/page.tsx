"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

// Phase 7에서 실제 할 일 목록 화면으로 교체된다. 지금은 Phase 6(인증 화면)의
// "가입 → 자동 로그인 → /todos 진입" 완료 조건을 확인할 자리만 만들어둔다.
export default function TodosPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-lg font-medium">{user?.name}님, 환영합니다.</p>
      <p className="text-sm text-muted-foreground">할 일 화면은 Phase 7에서 만들어집니다.</p>
      <Button variant="outline" onClick={logout}>
        로그아웃
      </Button>
    </div>
  );
}
