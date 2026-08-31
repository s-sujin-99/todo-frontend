"use client";

import { useSyncExternalStore } from "react";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const noopSubscribe = () => () => {};

// next-themes는 localStorage 값을 클라이언트에서만 읽으므로, 하이드레이션 전에는 서버와 동일한
// 중립 상태를 보여줘야 한다. useEffect+setState 대신 useSyncExternalStore로 클라이언트 시점을
// 감지하면 렌더 중 값을 읽는 것이라 리렌더가 연쇄되지 않는다(react-hooks/set-state-in-effect 회피).
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <Button variant="ghost" size="icon" aria-label="테마 전환" disabled>
        <Sun />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
