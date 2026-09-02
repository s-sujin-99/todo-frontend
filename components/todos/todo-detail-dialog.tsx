"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { PRIORITY_LABELS, RICH_TEXT_CONTENT_CLASS, stripHtml } from "@/lib/todo-utils";
import type { TodoResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttachmentPanel } from "@/components/todos/attachment-panel";

interface TodoDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo: TodoResponse | null;
  onEdit: (todo: TodoResponse) => void;
}

// 항목 클릭은 상세보기만 연다 — 수정은 별도 버튼(연필 아이콘 또는 이 다이얼로그의 "수정" 버튼)으로만 시작한다.
export function TodoDetailDialog({ open, onOpenChange, todo, onEdit }: TodoDetailDialogProps) {
  if (!todo) return null;

  const hasContent = todo.content && stripHtml(todo.content).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{todo.title}</DialogTitle>
        </DialogHeader>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              {todo.completed ? (
                <CheckCircle2 className="size-4 text-primary" />
              ) : (
                <Circle className="size-4" />
              )}
              {todo.completed ? "완료" : "미완료"}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
              {PRIORITY_LABELS[todo.priority]}
            </span>
            {todo.dueDate && <span>마감일 {todo.dueDate}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">내용</span>
            {hasContent ? (
              <div
                className={cn("min-w-0 text-sm", RICH_TEXT_CONTENT_CLASS)}
                dangerouslySetInnerHTML={{ __html: todo.content ?? "" }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">내용이 없습니다.</p>
            )}
          </div>

          <AttachmentPanel todoId={todo.id} readOnly />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onEdit(todo);
            }}
          >
            수정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
