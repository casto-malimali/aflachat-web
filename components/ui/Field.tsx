import { cn } from "@/lib/cn";
import { useId } from "react";

interface FieldRenderProps {
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

interface FieldProps {
  label: string;
  error?: string;
  className?: string;
  children: (props: FieldRenderProps) => React.ReactNode;
}

/** Accessible form field: associates <label> with the control and wires aria-* error state. */
export function Field({ label, error, className, children }: FieldProps) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errId : undefined,
      })}
      {error && (
        <p id={errId} role="alert" className="px-1 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

const fieldClasses =
  "w-full rounded-2xl border border-border bg-surface-2 px-6 py-4 text-base text-foreground " +
  "outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/30 " +
  "placeholder:text-muted-foreground/70";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClasses, "resize-none", className)} {...props} />;
}
