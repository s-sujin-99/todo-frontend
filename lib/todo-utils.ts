import type { Priority } from "@/lib/types";

export const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
};

// 목록 카드의 미리보기용. 서버가 이미 정제한 HTML이라 태그를 제거하고 텍스트만 남긴다.
export function stripHtml(html: string): string {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, " ").trim();
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").trim();
}

// FR-F07: 첨부 목록에 파일 크기를 사람이 읽기 쉬운 단위로 보여준다.
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
