"use client";

import { useRef, useState, type DragEvent } from "react";

import { Download, Loader2, Paperclip, Trash2, Upload } from "lucide-react";

import { formatFileSize } from "@/lib/todo-utils";
import { cn } from "@/lib/utils";
import {
  useAttachments,
  useDeleteAttachment,
  useDownloadAttachment,
  useUploadAttachment,
} from "@/hooks/use-attachments";
import { Button } from "@/components/ui/button";
import { AttachmentThumbnail } from "@/components/todos/attachment-thumbnail";

// FR-F01: 할 일 하나에 최대 5개. 서버가 최종 판정하지만 프론트도 넘는 개수는 아예 업로드를 시도하지 않는다.
const MAX_ATTACHMENTS = 5;

interface AttachmentPanelProps {
  todoId: number;
}

export function AttachmentPanel({ todoId }: AttachmentPanelProps) {
  const { data: attachments } = useAttachments(todoId);
  const uploadMutation = useUploadAttachment(todoId);
  const deleteMutation = useDeleteAttachment(todoId);
  const downloadMutation = useDownloadAttachment();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const count = attachments?.length ?? 0;
  const atLimit = count >= MAX_ATTACHMENTS;

  function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const slotsLeft = MAX_ATTACHMENTS - count;
    Array.from(files)
      .slice(0, Math.max(0, slotsLeft))
      .forEach((file) => uploadMutation.mutate(file));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    uploadFiles(event.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-sm font-medium text-foreground">
          <Paperclip className="size-4" /> 첨부파일
        </span>
        <span className="text-xs text-muted-foreground">
          {count}/{MAX_ATTACHMENTS}
        </span>
      </div>

      {attachments && attachments.length > 0 && (
        <ul className="flex flex-col gap-2">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
            >
              <AttachmentThumbnail attachment={attachment} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{attachment.originalName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.sizeBytes)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`${attachment.originalName} 다운로드`}
                disabled={downloadMutation.isPending}
                onClick={() =>
                  downloadMutation.mutate({
                    id: attachment.id,
                    filename: attachment.originalName,
                  })
                }
              >
                <Download />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`${attachment.originalName} 삭제`}
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(attachment.id)}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {!atLimit && (
        <div
          role="button"
          tabIndex={0}
          aria-label="파일을 끌어다 놓거나 클릭해서 첨부"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              업로드 중...
            </>
          ) : (
            <>
              <Upload className="size-5" />
              파일을 끌어다 놓거나 클릭해서 선택하세요
              <span>이미지·PDF·문서·zip, 개당 최대 10MB</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              uploadFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
