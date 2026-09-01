"use client";

import { useEffect, useState } from "react";

import { FileText } from "lucide-react";

import { fetchAttachmentBlob } from "@/lib/api-client";
import type { AttachmentResponse } from "@/lib/types";

interface AttachmentThumbnailProps {
  attachment: AttachmentResponse;
}

// FR-F07: 이미지 첨부는 썸네일을 보여준다. 정적 export 인증 방식(Bearer 헤더)이라
// <img src="/api/.../download">로 직접 가리킬 수 없어 blob을 받아 object URL로 변환한다.
export function AttachmentThumbnail({ attachment }: AttachmentThumbnailProps) {
  const [src, setSrc] = useState<string | null>(null);
  const isImage = attachment.contentType.startsWith("image/");

  useEffect(() => {
    if (!isImage) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    fetchAttachmentBlob(attachment.id)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        // 썸네일은 편의 기능이라 실패해도 파일 아이콘으로 대체되면 충분하다.
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.id, isImage]);

  if (isImage && src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- blob object URL은 next/image 최적화 대상이 아니다.
      <img
        src={src}
        alt={attachment.originalName}
        className="size-10 shrink-0 rounded object-cover"
      />
    );
  }

  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
      <FileText className="size-5" />
    </div>
  );
}
