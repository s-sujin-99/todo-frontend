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

// prose 계열 클래스는 @tailwindcss/typography 없이는 아무 효과가 없다(죽은 클래스).
// Tailwind Preflight가 ol/ul의 list-style과 h2의 font-size/font-weight를 지우므로 직접 되살린다.
// Tiptap 에디터(rich-text-editor.tsx)와 읽기 전용 상세보기(todo-detail-dialog.tsx)가 이 클래스를 공유해야
// 저장된 서식이 편집 화면과 상세보기에서 동일하게 보인다.
export const RICH_TEXT_CONTENT_CLASS =
  "[&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_h2]:text-lg [&_h2]:font-bold [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground";

// FR-F07: 첨부 목록에 파일 크기를 사람이 읽기 쉬운 단위로 보여준다.
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
