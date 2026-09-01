"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function ToolbarButton({
  active,
  ...props
}: React.ComponentProps<typeof Button> & { active?: boolean }) {
  return (
    <Button type="button" variant={active ? "secondary" : "ghost"} size="icon-sm" {...props} />
  );
}

// FR-T02: 툴바를 굵게·기울임·밑줄·취소선·목록·제목·인용·링크로 제한한다.
function Toolbar({ editor }: { editor: Editor }) {
  function setLink() {
    const previousUrl = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("링크 URL을 입력하세요", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input p-1.5">
      <ToolbarButton
        aria-label="굵게"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold />
      </ToolbarButton>
      <ToolbarButton
        aria-label="기울임"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </ToolbarButton>
      <ToolbarButton
        aria-label="밑줄"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline />
      </ToolbarButton>
      <ToolbarButton
        aria-label="취소선"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough />
      </ToolbarButton>
      <ToolbarButton
        aria-label="글머리 목록"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </ToolbarButton>
      <ToolbarButton
        aria-label="번호 목록"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolbarButton>
      <ToolbarButton
        aria-label="제목"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </ToolbarButton>
      <ToolbarButton
        aria-label="인용"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote />
      </ToolbarButton>
      <ToolbarButton aria-label="링크" active={editor.isActive("link")} onClick={setLink}>
        <LinkIcon />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    // 정적 export 환경에서 SSR 프리렌더와 하이드레이션 불일치를 막는다(ROADMAP Phase 7 주의).
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // 비목표 노드는 등록 자체를 막는다 — 서버 Safelist(HtmlSanitizer)와 1:1로 맞춘다(FR-T02·FR-T03).
        code: false,
        codeBlock: false,
        horizontalRule: false,
        heading: { levels: [2] },
        link: { openOnClick: false, autolink: true },
      }),
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    editorProps: {
      attributes: {
        // prose 계열 클래스는 @tailwindcss/typography 없이는 아무 효과가 없다(죽은 클래스).
        // Tailwind Preflight가 ol/ul의 list-style을 지우므로, 여기서 직접 되살린다.
        class:
          "max-w-none min-h-32 px-3 py-2 focus:outline-none [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6",
      },
    },
  });

  if (!editor) {
    return <div className="h-40 animate-pulse rounded-lg border border-input bg-muted" />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-input">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
