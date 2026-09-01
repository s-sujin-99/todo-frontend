"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient, downloadAttachment, toErrorMessage, uploadAttachment } from "@/lib/api-client";
import type { AttachmentResponse } from "@/lib/types";

function attachmentsKey(todoId: number) {
  return ["attachments", todoId] as const;
}

export function useAttachments(todoId: number | null) {
  return useQuery({
    queryKey: attachmentsKey(todoId ?? 0),
    queryFn: () => apiClient.get<AttachmentResponse[]>(`/api/todos/${todoId}/attachments`),
    enabled: todoId !== null,
  });
}

// FR-F07: 업로드 진행 중 상태는 isPending으로, 실패 시 파일명이 드러나는 에러 토스트로 안내한다.
export function useUploadAttachment(todoId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAttachment<AttachmentResponse>(todoId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attachmentsKey(todoId) });
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error: unknown) => {
      toast.error(toErrorMessage(error));
    },
  });
}

export function useDeleteAttachment(todoId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: number) =>
      apiClient.delete<void>(`/api/attachments/${attachmentId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attachmentsKey(todoId) });
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error: unknown) => {
      toast.error(toErrorMessage(error));
    },
  });
}

export function useDownloadAttachment() {
  return useMutation({
    mutationFn: ({ id, filename }: { id: number; filename: string }) =>
      downloadAttachment(id, filename),
    onError: (error: unknown) => {
      toast.error(toErrorMessage(error));
    },
  });
}
