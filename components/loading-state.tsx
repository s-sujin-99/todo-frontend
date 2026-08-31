interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "불러오는 중입니다..." }: LoadingStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
