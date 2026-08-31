"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/loading-state";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exchangeOAuthCode } = useAuth();
  // 코드는 1회용이라(FR-A09, 인수 12) React 18/19의 StrictMode 이중 실행에도 딱 한 번만 교환해야 한다.
  const hasExchangedRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.replace("/login?error=oauth");
      return;
    }
    if (hasExchangedRef.current) {
      return;
    }
    hasExchangedRef.current = true;

    exchangeOAuthCode(code)
      .then(() => router.replace("/todos"))
      .catch(() => router.replace("/login?error=oauth"));
  }, [searchParams, router, exchangeOAuthCode]);

  return <LoadingState message="구글 로그인 처리 중입니다..." />;
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingState message="구글 로그인 처리 중입니다..." />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
