import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  /** FR-U08: "무슨 일이 있었는지 + 다음에 무엇을 할지"를 담은 한 문장. lib/api-client의 toErrorMessage로 만든다 */
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-16 text-center">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}
