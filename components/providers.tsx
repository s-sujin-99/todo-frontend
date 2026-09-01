"use client";

import { useState, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
