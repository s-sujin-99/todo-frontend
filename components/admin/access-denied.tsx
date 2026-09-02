import Link from "next/link";

import { Button } from "@/components/ui/button";

// FR-M10: 편의를 위한 안내일 뿐 보안 수단이 아니다 — 실제 차단은 서버의 FR-M02가 담당한다.
export function AccessDenied() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-lg font-semibold">접근 권한이 없습니다</h1>
      <p className="text-sm text-muted-foreground">
        이 페이지는 관리자만 볼 수 있습니다. 할 일 목록으로 돌아가주세요.
      </p>
      <Button asChild>
        <Link href="/todos">할 일 목록으로 돌아가기</Link>
      </Button>
    </div>
  );
}
