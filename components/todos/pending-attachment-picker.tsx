"use client";

import { useRef, useState, type DragEvent } from "react";

import { Paperclip, Upload, X } from "lucide-react";

import { formatFileSize } from "@/lib/todo-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MAX_ATTACHMENTS } from "@/components/todos/attachment-panel";

interface PendingAttachmentPickerProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

// FR-F03: 생성 중에는 todoId가 없어 업로드할 수 없으므로, 저장 전까지 파일을 로컬에만 들고 있다가
// 할 일 생성이 성공한 직후 새로 받은 id로 순차 업로드한다(app/todos/page.tsx 참고).
export function PendingAttachmentPicker({
  files,
  onFilesChange,
  disabled = false,
}: PendingAttachmentPickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const count = files.length;
  const atLimit = count >= MAX_ATTACHMENTS;

  function addFiles(newFiles: FileList | null) {
    if (!newFiles || newFiles.length === 0) return;
    const slotsLeft = MAX_ATTACHMENTS - count;
    onFilesChange([...files, ...Array.from(newFiles).slice(0, Math.max(0, slotsLeft))]);
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) addFiles(event.dataTransfer.files);
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

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`${file.name} 제거`}
                disabled={disabled}
                onClick={() => removeFile(index)}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {!atLimit && (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="파일을 끌어다 놓거나 클릭해서 첨부"
          aria-disabled={disabled}
          onClick={() => {
            if (!disabled) inputRef.current?.click();
          }}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground transition-colors",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          <Upload className="size-5" />
          파일을 끌어다 놓거나 클릭해서 선택하세요
          <span>이미지·PDF·문서·zip, 개당 최대 10MB — 저장 시 함께 업로드됩니다</span>
          <input
            ref={inputRef}
            type="file"
            multiple
            disabled={disabled}
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
