import { useEffect, useRef } from "react";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/cn";

interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  streaming: boolean;
  placeholder: string;
  sendLabel: string;
  stopLabel: string;
  maxLength?: number;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  streaming,
  placeholder,
  sendLabel,
  stopLabel,
  maxLength = 500,
  inputRef,
}: ComposerProps) {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = inputRef ?? localRef;

  // Auto-grow up to ~4 lines.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [value, ref]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!streaming) onSubmit();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex items-end gap-2 border-t border-border bg-surface p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        rows={1}
        maxLength={maxLength}
        enterKeyHint="send"
        className={cn(
          "min-w-0 flex-1 resize-none rounded-2xl border border-border bg-surface-2 px-4 py-2.5",
          "text-base leading-snug text-foreground outline-none",
          "focus:border-secondary focus:ring-2 focus:ring-secondary/30 placeholder:text-muted-foreground/70",
        )}
      />
      {streaming ? (
        <button
          type="button"
          aria-label={stopLabel}
          onClick={onStop}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/80 text-background transition-opacity hover:opacity-90"
        >
          <Square size={16} className="fill-current" aria-hidden />
        </button>
      ) : (
        <button
          type="submit"
          aria-label={sendLabel}
          disabled={!value.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
        >
          <Send size={18} aria-hidden />
        </button>
      )}
    </form>
  );
}
