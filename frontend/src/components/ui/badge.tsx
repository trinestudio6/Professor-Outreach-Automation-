import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] uppercase tracking-wider font-bold transition-colors shadow-sm backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-muted/50 text-muted-foreground",
        accent: "border-accent/30 bg-accent/20 text-accent filter drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]",
        success: "border-success/30 bg-success/20 text-success filter drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]",
        warning: "border-warning/30 bg-warning/20 text-warning filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]",
        destructive: "border-destructive/30 bg-destructive/20 text-destructive filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
