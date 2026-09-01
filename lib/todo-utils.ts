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
