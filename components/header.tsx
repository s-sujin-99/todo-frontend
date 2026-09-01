"use client";

import Link from "next/link";

import { LogOut } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-base font-semibold">
          할 일 관리
        </Link>
        <div className="flex items-center gap-1">
          {user && (
            <Button variant="ghost" size="icon-sm" aria-label="로그아웃" onClick={logout}>
              <LogOut />
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
