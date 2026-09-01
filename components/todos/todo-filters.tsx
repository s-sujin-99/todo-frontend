"use client";

import type { TodoSortOption, TodoStatusFilter } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TodoFiltersProps {
  status: TodoStatusFilter;
  sort: TodoSortOption;
  onStatusChange: (status: TodoStatusFilter) => void;
  onSortChange: (sort: TodoSortOption) => void;
}

// FR-L03
const STATUS_OPTIONS: { value: TodoStatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "incomplete", label: "미완료" },
  { value: "completed", label: "완료" },
];

// FR-L04
const SORT_OPTIONS: { value: TodoSortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "dueDate", label: "마감일순" },
];

export function TodoFilters({ status, sort, onStatusChange, onSortChange }: TodoFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={(value) => onStatusChange(value as TodoStatusFilter)}>
        <SelectTrigger aria-label="상태 필터">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(value) => onSortChange(value as TodoSortOption)}>
        <SelectTrigger aria-label="정렬">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
