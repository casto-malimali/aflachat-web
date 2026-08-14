import { memo, useState } from "react";
import dynamic from "next/dynamic";
import { Bot, Check, CloudOff, Copy, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/cn";

// Lazy-load react-markdown so the (sizable) markdown stack stays out of the
// shared bundle — it loads only when the chat panel renders an AI message.
const Markdown = dynamic(() => import("./Markdown").then((m) => m.Markdown), {
  ssr: false,
  loading: () => null,
});

export type Msg = {
  id: string;
  role: "user" | "ai";
  content: string;
  offline?: boolean;
  messageId?: string;
  feedback?: "up" | "down";
  streaming?: boolean;
};

interface Labels {
  copy: string;
  copied: string;
  regenerate: string;
  helpful: string;
  notHelpful: string;
  savedGuidance: string;
}

interface MessageBubbleProps {
  msg: Msg;
  isLast: boolean;
  labels: Labels;
  onRegenerate: () => void;
  onFeedback: (rating: "up" | "down") => void;
}

function MessageBubbleBase({ msg, isLast, labels, onRegenerate, onFeedback }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-xs">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
        <Bot size={16} aria-hidden />
      </div>
      <div className="min-w-0 max-w-[85%]">
        <div
          className={cn(
            "rounded-2xl rounded-bl-sm border px-3.5 py-2.5 text-sm leading-relaxed shadow-xs",
            msg.offline ? "border-warning/40 bg-warning/5 text-foreground" : "border-border bg-surface text-foreground",
          )}
        >
          {msg.offline && (
            <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
              <CloudOff size={11} aria-hidden /> {labels.savedGuidance}
            </span>
          )}
          {msg.content ? <Markdown content={msg.content} /> : null}
          {msg.streaming && <span className="ml-0.5 inline-block w-1.5 animate-pulse">▍</span>}
        </div>

        {/* Actions — only on completed AI answers */}
        {!msg.streaming && msg.content && (
          <div className="mt-1.5 flex items-center gap-1">
            <IconAction label={copied ? labels.copied : labels.copy} onClick={copy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </IconAction>
            {isLast && (
              <IconAction label={labels.regenerate} onClick={onRegenerate}>
                <RefreshCw size={14} />
              </IconAction>
            )}
            <IconAction
              label={labels.helpful}
              active={msg.feedback === "up"}
              variant="up"
              onClick={() => onFeedback("up")}
            >
              <ThumbsUp size={14} />
            </IconAction>
            <IconAction
              label={labels.notHelpful}
              active={msg.feedback === "down"}
              variant="down"
              onClick={() => onFeedback("down")}
            >
              <ThumbsDown size={14} />
            </IconAction>
          </div>
        )}
      </div>
    </div>
  );
}

function IconAction({
  label,
  active,
  variant,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  variant?: "up" | "down";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const activeClass =
    variant === "up"
      ? "bg-emerald-50 text-emerald-600"
      : variant === "down"
        ? "bg-rose-50 text-rose-600"
        : "bg-secondary/15 text-secondary";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
        active ? activeClass : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export const MessageBubble = memo(MessageBubbleBase);
