"use client";

import { toErrorMessage } from "@/lib/api-client";
import { useAdminStats } from "@/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";

// FR-M08: 전체 사용자 수 · 활성 사용자 수 · 전체 할 일 수 · 완료 수.
export function StatsCards() {
  const { data, isLoading, isError, error, refetch } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState message={toErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const cards = [
    { label: "전체 사용자", value: data.totalUsers },
    { label: "활성 사용자", value: data.activeUsers },
    { label: "전체 할 일", value: data.totalTodos },
    { label: "완료된 할 일", value: data.completedTodos },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold">{card.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
