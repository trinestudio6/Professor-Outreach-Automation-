import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  meta?: ReactNode;
}

export function PageHeader({ title, meta }: PageHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
      <h1 className="text-sm font-medium text-foreground">{title}</h1>
      {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
    </header>
  );
}
