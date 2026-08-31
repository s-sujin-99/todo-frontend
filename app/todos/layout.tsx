import { AuthGuard } from "@/components/auth-guard";

export default function TodosLayout({ children }: LayoutProps<"/todos">) {
  return <AuthGuard>{children}</AuthGuard>;
}
