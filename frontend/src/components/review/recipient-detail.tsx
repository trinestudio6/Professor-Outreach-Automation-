import { FileText, ExternalLink, Check, X } from "lucide-react";
import type { PendingRecipient } from "@/types/recipient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface RecipientDetailProps {
  recipient: PendingRecipient;
  onApprove: () => void;
  onReject: () => void;
  processing: boolean;
}

export function RecipientDetail({
  recipient,
  onApprove,
  onReject,
  processing,
}: RecipientDetailProps) {
  return (
    <div className="flex h-full flex-col animate-fade-in">
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-medium text-foreground">
              {recipient.professor_name}
            </h2>
            <Badge variant="warning">Review required</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {recipient.university}
          </p>
          {recipient.research_interest && (
            <p className="mt-2 text-xs text-muted-foreground/80">
              Matched for:{" "}
              <span className="text-foreground/80">{recipient.research_interest}</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReject} disabled={processing}>
            <X className="h-3.5 w-3.5" strokeWidth={2} />
            Reject
          </Button>
          <Button size="sm" onClick={onApprove} disabled={processing}>
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
            Approve &amp; queue
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">To</dt>
          <dd className="text-foreground">{recipient.professor_email}</dd>

          <dt className="text-muted-foreground">Subject</dt>
          <dd className="text-foreground">{recipient.draft_subject}</dd>

          <dt className="text-muted-foreground">Profile</dt>
          <dd>
            {recipient.canonical_profile_url ? (
              <a
                href={recipient.canonical_profile_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-accent hover:underline"
              >
                {recipient.canonical_profile_url.replace(/^https?:\/\//, "")}
                <ExternalLink className="h-3 w-3" strokeWidth={2} />
              </a>
            ) : (
              <span className="text-muted-foreground italic">No Profile URL</span>
            )}
          </dd>
        </dl>

        <Separator className="my-5" />

        <div
          className="prose-sm max-w-none text-sm leading-relaxed text-foreground/90 [&_p]:mb-3 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: recipient.draft_html_body || "<p className='text-muted-foreground italic'>Draft generation pending...</p>" }}
        />

        <Separator className="my-5" />

        <a
          href="#"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="truncate">{recipient.draft_cv_object_key ? recipient.draft_cv_object_key.split("/").pop() : "No CV Attached"}</span>
        </a>
      </div>
    </div>
  );
}
