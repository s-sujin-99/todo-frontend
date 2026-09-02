"use client";

import { useState, type FormEvent } from "react";

import { toErrorMessage } from "@/lib/api-client";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Pagination } from "@/components/pagination";

// FR-M04, FR-M05: 이메일 검색 + 페이지네이션, 계정 활성/비활성 전환(자기 자신은 서버가 거부하지만
// 화면에서도 버튼을 미리 비활성화해 무의미한 요청을 막는다).
export function UserList() {
  const { user: currentUser } = useAuth();
  const [emailInput, setEmailInput] = useState("");
  const [email, setEmail] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, error, refetch } = useAdminUsers(email, page);
  const updateStatus = useUpdateUserStatus();

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmail(emailInput.trim());
    setPage(0);
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <Input
          placeholder="이메일로 검색"
          value={emailInput}
          onChange={(event) => setEmailInput(event.target.value)}
          aria-label="이메일 검색"
        />
        <Button type="submit" variant="outline">
          검색
        </Button>
      </form>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={toErrorMessage(error)} onRetry={() => void refetch()} />
      ) : data && data.content.length > 0 ? (
        <>
          <ul className="flex flex-col gap-2">
            {data.content.map((target) => {
              const isSelf = target.id === currentUser?.id;
              return (
                <li
                  key={target.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{target.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {target.name} · {target.role === "ADMIN" ? "관리자" : "사용자"} ·{" "}
                      {target.provider === "GOOGLE" ? "구글" : "이메일"}
                    </p>
                  </div>
                  <Button
                    variant={target.enabled ? "outline" : "destructive"}
                    size="sm"
                    disabled={isSelf || updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: target.id, enabled: !target.enabled })}
                  >
                    {target.enabled ? "활성" : "비활성"}
                  </Button>
                </li>
              );
            })}
          </ul>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState title="사용자가 없습니다" description="검색어를 확인해주세요." />
      )}
    </div>
  );
}
