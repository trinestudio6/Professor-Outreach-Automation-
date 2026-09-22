import { cn } from "@/lib/utils";
import type { StatusTone } from "@/lib/status";

const toneClasses: Record<StatusTone, string> = {
  pending: "bg-warning",
  success: "bg-success",
  danger: "bg-destructive",
  neutral: "bg-muted-foreground",
};

interface StatusDotProps {
  tone: StatusTone;
  label: string;
}

export function StatusDot({ tone, label }: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", toneClasses[tone])} />
      {label}
    </span>
  );
}
