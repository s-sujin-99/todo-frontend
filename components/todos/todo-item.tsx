"use client";

import { Paperclip, Pencil, Trash2 } from "lucide-react";

import { PRIORITY_LABELS, stripHtml } from "@/lib/todo-utils";
import type { TodoResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface TodoItemProps {
  todo: TodoResponse;
  onToggle: (id: number) => void;
  onView: (todo: TodoResponse) => void;
  onEdit: (todo: TodoResponse) => void;
  onDelete: (id: number) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

export function TodoItem({
  todo,
  onToggle,
  onView,
  onEdit,
  onDelete,
  isToggling,
  isDeleting,
}: TodoItemProps) {
  const preview = todo.content ? stripHtml(todo.content) : "";

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:gap-3">
      <Checkbox
        checked={todo.completed}
        disabled={isToggling}
        onCheckedChange={() => onToggle(todo.id)}
        aria-label={todo.completed ? "완료 해제" : "완료로 표시"}
      />

      {/* 항목 클릭은 읽기 전용 상세보기를 연다 — 수정은 연필 아이콘으로만 시작한다. */}
      <button
        type="button"
        onClick={() => onView(todo)}
        className="-m-1 min-w-0 flex-1 rounded-md p-1 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
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
          {todo.dueDate && <span className="text-xs text-muted-foreground">{todo.dueDate}</span>}
          {/* FR-F08: 첨부가 있는 할 일에 클립 아이콘과 개수를 표시한다. */}
          {todo.attachmentCount > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Paperclip className="size-3" />
              {todo.attachmentCount}
            </span>
          )}
        </div>
        {preview && <p className="mt-1 truncate text-xs text-muted-foreground">{preview}</p>}
      </button>

      <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
        <Button variant="ghost" size="icon-sm" aria-label="수정" onClick={() => onEdit(todo)}>
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="삭제"
          disabled={isDeleting}
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}
