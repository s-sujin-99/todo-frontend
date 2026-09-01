"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient, toErrorMessage } from "@/lib/api-client";
import type {
  PageResponse,
  TodoRequest,
  TodoResponse,
  TodoSortOption,
  TodoStatusFilter,
} from "@/lib/types";

const PAGE_SIZE = 10;

export interface TodoListParams {
  status: TodoStatusFilter;
  sort: TodoSortOption;
  page: number;
}

function todoListKey(params: TodoListParams) {
  return ["todos", params.status, params.sort, params.page] as const;
}

export function useTodoList(params: TodoListParams) {
  return useQuery({
    queryKey: todoListKey(params),
    queryFn: () =>
      apiClient.get<PageResponse<TodoResponse>>(
        `/api/todos?page=${params.page}&size=${PAGE_SIZE}&status=${params.status}&sort=${params.sort}`,
      ),
    // 페이지 이동마다 스켈레톤이 번쩍이지 않도록 이전 페이지 데이터를 유지한 채 갱신한다.
    placeholderData: keepPreviousData,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: TodoRequest) => apiClient.post<TodoResponse>("/api/todos", request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error: unknown) => {
      toast.error(toErrorMessage(error));
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: TodoRequest }) =>
      apiClient.put<TodoResponse>(`/api/todos/${id}`, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error: unknown) => {
      toast.error(toErrorMessage(error));
    },
  });
}

// FR-U05(낙관적 업데이트·롤백)와 FR-L06(필터 이탈 시 제거, 페이지 소진 시 이전 페이지 이동)를 함께 처리한다.
export function useToggleTodo(params: TodoListParams, onPageBack: () => void) {
  const queryClient = useQueryClient();
  const queryKey = todoListKey(params);

  return useMutation({
    mutationFn: (id: number) => apiClient.patch<TodoResponse>(`/api/todos/${id}/toggle`),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PageResponse<TodoResponse>>(queryKey);
      queryClient.setQueryData<PageResponse<TodoResponse>>(queryKey, (old) => {
        if (!old) return old;
        const target = old.content.find((todo) => todo.id === id);
        if (!target) return old;
        const nextCompleted = !target.completed;
        const leavesFilter =
          (params.status === "completed" && !nextCompleted) ||
          (params.status === "incomplete" && nextCompleted);
        if (leavesFilter) {
          return {
            ...old,
            content: old.content.filter((todo) => todo.id !== id),
            totalElements: Math.max(0, old.totalElements - 1),
          };
        }
        return {
          ...old,
          content: old.content.map((todo) =>
            todo.id === id ? { ...todo, completed: nextCompleted } : todo,
          ),
        };
      });
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error("완료 상태를 변경하지 못했습니다. 다시 시도해주세요.");
    },
    onSuccess: () => {
      const current = queryClient.getQueryData<PageResponse<TodoResponse>>(queryKey);
      if (current && current.content.length === 0 && params.page > 0) {
        onPageBack();
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useDeleteTodo(params: TodoListParams, onPageBack: () => void) {
  const queryClient = useQueryClient();
  const queryKey = todoListKey(params);

  return useMutation({
    mutationFn: (id: number) => apiClient.delete<void>(`/api/todos/${id}`),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PageResponse<TodoResponse>>(queryKey);
      queryClient.setQueryData<PageResponse<TodoResponse>>(queryKey, (old) =>
        old
          ? {
              ...old,
              content: old.content.filter((todo) => todo.id !== id),
              totalElements: Math.max(0, old.totalElements - 1),
            }
          : old,
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error("삭제하지 못했습니다. 다시 시도해주세요.");
    },
    onSuccess: () => {
      const current = queryClient.getQueryData<PageResponse<TodoResponse>>(queryKey);
      if (current && current.content.length === 0 && params.page > 0) {
        onPageBack();
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
