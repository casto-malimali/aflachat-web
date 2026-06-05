import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { ArrowUpRight } from "lucide-react";

/**
 * Renders model-generated markdown. Output is sanitized (rehype-sanitize) — this
 * is mandatory since the content comes from an LLM. Styled to match the chat bubbles.
 */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed [&_p]:m-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-medium text-secondary underline underline-offset-2"
            >
              {children}
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          code: ({ className, children }) => {
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-md bg-foreground/[0.06] p-3 font-mono text-xs">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-foreground/[0.06] px-1 py-0.5 font-mono text-[0.85em]">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border border-border px-2 py-1 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
