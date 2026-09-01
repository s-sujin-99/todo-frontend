"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { getGoogleLoginUrl, toErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/loading-state";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 백엔드 OAuth2LoginFailureHandler(Phase 3)가 실패 시 여기로 error=oauth를 붙여 되돌려보낸다.
  // expired=1은 useAuth가 401(만료된 토큰)을 받았을 때 붙인다(인수 14).
  const banner =
    searchParams.get("error") === "oauth"
      ? "구글 로그인에 실패했습니다. 다시 시도해주세요."
      : searchParams.get("expired") === "1"
        ? "로그인이 만료되었습니다. 다시 로그인해주세요."
        : searchParams.get("reset") === "1"
          ? "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요."
          : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/todos");
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-xl font-semibold">로그인</h1>

      {banner && <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{banner}</p>}
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      <Link
        href="/forgot-password"
        className="text-center text-sm text-muted-foreground underline underline-offset-4"
      >
        비밀번호를 잊으셨나요?
      </Link>

      <Button variant="outline" asChild>
        <a href={getGoogleLoginUrl()}>구글로 로그인</a>
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          회원가입
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginForm />
    </Suspense>
  );
}
