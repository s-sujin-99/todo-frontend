"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  /** 0-based 현재 페이지 (백엔드 응답과 동일한 기준) */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SIBLING_COUNT = 1;

// 항상 첫/마지막 페이지와 현재 페이지 주변만 보여주고 나머지는 생략(…) 처리한다(FR-L05, 인수 15).
function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  const keep = new Set<number>([0, total - 1, current]);
  for (let offset = 1; offset <= SIBLING_COUNT; offset += 1) {
    if (current - offset >= 0) keep.add(current - offset);
    if (current + offset <= total - 1) keep.add(current + offset);
  }

  const sorted = [...keep].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let previous: number | null = null;
  for (const page of sorted) {
    if (previous !== null && page - previous > 1) {
      result.push("ellipsis");
    }
    result.push(page);
    previous = page;
  }
  return result;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav aria-label="페이지 네비게이션" className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        aria-label="이전 페이지"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft />
      </Button>

      {/* 데스크톱: 번호와 생략(…) 표시 */}
      <div className="hidden items-center gap-1 sm:flex">
        {pageNumbers.map((entry, index) =>
          entry === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="px-2 text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={entry}
              variant={entry === page ? "default" : "outline"}
              size="icon"
              aria-label={`${entry + 1}페이지로 이동`}
              aria-current={entry === page ? "page" : undefined}
              onClick={() => onPageChange(entry)}
            >
              {entry + 1}
            </Button>
          ),
        )}
      </div>

      {/* 모바일: 화면이 좁을 때는 "현재 / 전체"만 축약해서 보여준다 */}
      <span className="px-2 text-sm text-muted-foreground sm:hidden">
        {page + 1} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="icon"
        aria-label="다음 페이지"
        disabled={page === totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
