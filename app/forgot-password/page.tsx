"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { apiClient, toErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// FR-R01, R03, R07: 가입 여부·소셜 계정 여부·재요청 제한 여부와 무관하게 항상 같은 성공 메시지를 보여준다.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.post<void>("/api/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-xl font-semibold">비밀번호 재설정</h1>

      {isSubmitted ? (
        <p className="text-sm text-muted-foreground">
          입력하신 이메일이 가입되어 있다면 재설정 링크를 보내드렸습니다. 메일함을 확인해주세요.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "전송 중..." : "재설정 링크 보내기"}
            </Button>
          </form>
        </>
      )}

      <Link
        href="/login"
        className="text-center text-sm text-muted-foreground underline underline-offset-4"
      >
        로그인으로 돌아가기
      </Link>
    </div>
  );
}
