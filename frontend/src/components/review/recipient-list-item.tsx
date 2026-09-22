import type { PendingRecipient } from "@/types/recipient";
import { StatusDot } from "@/components/shared/status-dot";
import { cn } from "@/lib/utils";

interface RecipientListItemProps {
  recipient: PendingRecipient;
  selected: boolean;
  onSelect: () => void;
}

export function RecipientListItem({ recipient, selected, onSelect }: RecipientListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-1.5 border-b border-border px-4 py-3 text-left transition-colors",
        selected ? "bg-muted" : "hover:bg-muted/50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-foreground">
          {recipient.professor_name}
        </span>
        <StatusDot tone="pending" label="Review" />
      </div>
      <span className="truncate text-xs text-muted-foreground">
        {recipient.university}
      </span>
      <span className="truncate text-xs text-muted-foreground/70">
        {recipient.draft_subject}
      </span>
    </button>
  );
}
