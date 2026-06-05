export function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex justify-start">
      <div
        className="flex gap-1 rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3"
        role="status"
      >
        <span className="sr-only">{label}</span>
        <Dot />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      aria-hidden
      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
      style={{ animationDelay: delay }}
    />
  );
}
