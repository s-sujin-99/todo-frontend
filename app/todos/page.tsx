"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { toErrorMessage } from "@/lib/api-client";
import type { TodoRequest, TodoResponse, TodoSortOption, TodoStatusFilter } from "@/lib/types";
import {
  useCreateTodo,
  useDeleteTodo,
  useTodoList,
  useToggleTodo,
  useUpdateTodo,
  type TodoListParams,
} from "@/hooks/use-todos";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { Pagination } from "@/components/pagination";
import { TodoDetailDialog } from "@/components/todos/todo-detail-dialog";
import { TodoDialog } from "@/components/todos/todo-dialog";
import { TodoFilters } from "@/components/todos/todo-filters";
import { TodoItem } from "@/components/todos/todo-item";

function isValidStatus(value: string | null): value is TodoStatusFilter {
  return value === "all" || value === "incomplete" || value === "completed";
}

function isValidSort(value: string | null): value is TodoSortOption {
  return value === "latest" || value === "dueDate";
}

// 상태·정렬·페이지를 URL 쿼리에 둔다(ROADMAP Phase 5 주의: useSearchParams 화면은 Suspense 경계 필수).
function TodosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status: TodoStatusFilter = isValidStatus(searchParams.get("status"))
    ? (searchParams.get("status") as TodoStatusFilter)
    : "all";
  const sort: TodoSortOption = isValidSort(searchParams.get("sort"))
    ? (searchParams.get("sort") as TodoSortOption)
    : "latest";
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam >= 0 ? pageParam : 0;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingTodo, setViewingTodo] = useState<TodoResponse | null>(null);

  function updateParams(next: { status?: TodoStatusFilter; sort?: TodoSortOption; page?: number }) {
    const params = new URLSearchParams(searchParams);
    // FR-L06: 필터·정렬이 바뀌면 이전 페이지 번호가 더 이상 유효하지 않을 수 있어 첫 페이지로 되돌린다.
    if (next.status !== undefined) {
      params.set("status", next.status);
      params.set("page", "0");
    }
    if (next.sort !== undefined) {
      params.set("sort", next.sort);
      params.set("page", "0");
    }
    if (next.page !== undefined) {
      params.set("page", String(next.page));
    }
    router.replace(`/todos?${params.toString()}`);
  }

  const listParams: TodoListParams = { status, sort, page };
  const { data, isLoading, isError, error, refetch } = useTodoList(listParams);

  const goToPreviousPage = () => updateParams({ page: Math.max(0, page - 1) });

  const toggleMutation = useToggleTodo(listParams, goToPreviousPage);
  const deleteMutation = useDeleteTodo(listParams, goToPreviousPage);
  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();

  function openCreateDialog() {
    setEditingTodo(null);
    setDialogOpen(true);
  }

  function openEditDialog(todo: TodoResponse) {
    setEditingTodo(todo);
    setDialogOpen(true);
  }

  function openDetailDialog(todo: TodoResponse) {
    setViewingTodo(todo);
    setDetailOpen(true);
  }

  async function handleDialogSubmit(request: TodoRequest) {
    try {
      if (editingTodo) {
        await updateMutation.mutateAsync({ id: editingTodo.id, request });
        toast.success("할 일을 수정했습니다.");
      } else {
        await createMutation.mutateAsync(request);
        toast.success("할 일을 추가했습니다.");
      }
      setDialogOpen(false);
    } catch {
      // 실패 토스트는 각 뮤테이션의 onError에서 이미 표시했다. 다이얼로그는 열어둔 채 재시도를 유도한다.
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TodoFilters
          status={status}
          sort={sort}
          onStatusChange={(next) => updateParams({ status: next })}
          onSortChange={(next) => updateParams({ sort: next })}
        />
        <Button onClick={openCreateDialog}>
          <Plus /> 새 할 일
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={toErrorMessage(error)} onRetry={() => void refetch()} />
      ) : data && data.content.length > 0 ? (
        <>
          <ul className="flex flex-col gap-2">
            {data.content.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={(id) => toggleMutation.mutate(id)}
                onView={openDetailDialog}
                onEdit={openEditDialog}
                onDelete={(id) => deleteMutation.mutate(id)}
                isToggling={toggleMutation.isPending && toggleMutation.variables === todo.id}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === todo.id}
              />
            ))}
          </ul>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={(next) => updateParams({ page: next })}
          />
        </>
      ) : (
        <EmptyState
          title="할 일이 없습니다"
          description="새 할 일 버튼을 눌러 첫 항목을 추가해보세요."
        />
      )}

      <TodoDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        todo={viewingTodo}
        onEdit={openEditDialog}
      />

      <TodoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        todo={editingTodo}
        onSubmit={handleDialogSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

export default function TodosPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TodosPageContent />
    </Suspense>
  );
}
