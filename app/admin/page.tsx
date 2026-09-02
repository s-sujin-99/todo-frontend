"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { StatsCards } from "@/components/admin/stats-cards";
import { TodoList } from "@/components/admin/todo-list";
import { UserList } from "@/components/admin/user-list";

type AdminTab = "stats" | "users" | "todos";

const TABS: { value: AdminTab; label: string }[] = [
  { value: "stats", label: "요약 통계" },
  { value: "users", label: "사용자 목록" },
  { value: "todos", label: "전체 할 일" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("stats");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-semibold">관리자</h1>

      <div role="tablist" className="flex gap-1 border-b border-border">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={cn(
              "px-3 py-2 text-sm font-medium text-muted-foreground",
              tab === item.value && "border-b-2 border-primary text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "stats" && <StatsCards />}
      {tab === "users" && <UserList />}
      {tab === "todos" && <TodoList />}
    </div>
  );
}
