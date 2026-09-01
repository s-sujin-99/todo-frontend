"use client";

import { Pencil, Trash2 } from "lucide-react";

import { PRIORITY_LABELS, stripHtml } from "@/lib/todo-utils";
import type { TodoResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface TodoItemProps {
  todo: TodoResponse;
  onToggle: (id: number) => void;
  onEdit: (todo: TodoResponse) => void;
  onDelete: (id: number) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

export function TodoItem({
  todo,
  onToggle,
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

      <div className="min-w-0 flex-1">
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
        </div>
        {preview && <p className="mt-1 truncate text-xs text-muted-foreground">{preview}</p>}
      </div>

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
