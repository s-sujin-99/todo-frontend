"use client";

import { useState } from "react";

import { toErrorMessage } from "@/lib/api-client";
import { PRIORITY_LABELS } from "@/lib/todo-utils";
import { cn } from "@/lib/utils";
import { useAdminTodos } from "@/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Pagination } from "@/components/pagination";

// FR-M07: 전체 할 일을 작성자와 함께 조회한다.
export function TodoList() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, error, refetch } = useAdminTodos(page);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={toErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  if (!data || data.content.length === 0) {
    return <EmptyState title="할 일이 없습니다" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {data.content.map((todo) => (
          <li
            key={todo.id}
            className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  todo.completed && "text-muted-foreground line-through",
                )}
              >
                {todo.title}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {PRIORITY_LABELS[todo.priority]}
              </span>
              {todo.dueDate && (
                <span className="text-xs text-muted-foreground">{todo.dueDate}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {todo.authorName} ({todo.authorEmail})
            </p>
          </li>
        ))}
      </ul>
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
