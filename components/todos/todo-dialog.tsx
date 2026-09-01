"use client";

import { useState, type FormEvent } from "react";
import dynamic from "next/dynamic";

import { PRIORITY_LABELS } from "@/lib/todo-utils";
import type { Priority, TodoRequest, TodoResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 다이얼로그를 열 때만 불러온다 — 초기 번들에서 Tiptap을 분리한다(ROADMAP Phase 7 주의).
const RichTextEditor = dynamic(
  () => import("@/components/todos/rich-text-editor").then((mod) => mod.RichTextEditor),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> },
);

interface TodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null이면 생성, 값이 있으면 해당 항목 수정 */
  todo: TodoResponse | null;
  onSubmit: (request: TodoRequest) => Promise<void>;
  isSubmitting: boolean;
}

const PRIORITY_OPTIONS: Priority[] = ["HIGH", "MEDIUM", "LOW"];

export function TodoDialog({ open, onOpenChange, todo, onSubmit, isSubmitting }: TodoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{todo ? "할 일 수정" : "새 할 일"}</DialogTitle>
        </DialogHeader>

        {/*
          todo?.id를 key로 써서 대상이 바뀔 때마다 폼을 통째로 다시 마운트한다.
          effect로 setState를 되돌리는 대신(react-hooks/set-state-in-effect 위반),
          useState 초기값에서 곧바로 읽게 해 리렌더 캐스케이드를 없앤다.
        */}
        <TodoForm
          key={open ? (todo?.id ?? "create") : "closed"}
          todo={todo}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}

interface TodoFormProps {
  todo: TodoResponse | null;
  onSubmit: (request: TodoRequest) => Promise<void>;
  isSubmitting: boolean;
}

function TodoForm({ todo, onSubmit, isSubmitting }: TodoFormProps) {
  const [title, setTitle] = useState(todo?.title ?? "");
  const [content, setContent] = useState(todo?.content ?? "");
  const [dueDate, setDueDate] = useState(todo?.dueDate ?? "");
  const [priority, setPriority] = useState<Priority>(todo?.priority ?? "MEDIUM");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      title,
      content: content || null,
      dueDate: dueDate || null,
      priority,
    });
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="todo-title">제목</Label>
        <Input
          id="todo-title"
          required
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>내용</Label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="todo-due-date">마감일</Label>
          <Input
            id="todo-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="todo-priority">우선순위</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
            <SelectTrigger id="todo-priority" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {PRIORITY_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </DialogFooter>
    </form>
  );
}
