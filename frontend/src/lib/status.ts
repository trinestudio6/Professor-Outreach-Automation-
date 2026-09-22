export type RecipientStatus =
  | "DISCOVERED"
  | "SELECTED"
  | "ENRICHING"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "PROCESSING"
  | "SENT"
  | "REPLIED"
  | "BOUNCED"
  | "RETRYABLE_FAILED"
  | "PERMANENT_FAILED"
  | "DO_NOT_CONTACT";

export type StatusTone = "neutral" | "pending" | "success" | "danger";

interface StatusMeta {
  label: string;
  tone: StatusTone;
}

/** Fixed order matches the real state machine in workflows/n8n-professor-outreach-v2-review.md */
export const RECIPIENT_STATUS_ORDER: RecipientStatus[] = [
  "DISCOVERED",
  "SELECTED",
  "ENRICHING",
  "REVIEW_REQUIRED",
  "APPROVED",
  "PROCESSING",
  "SENT",
  "REPLIED",
  "BOUNCED",
  "RETRYABLE_FAILED",
  "PERMANENT_FAILED",
  "DO_NOT_CONTACT",
];

export const STATUS_META: Record<RecipientStatus, StatusMeta> = {
  DISCOVERED: { label: "Discovered", tone: "neutral" },
  SELECTED: { label: "Selected", tone: "neutral" },
  ENRICHING: { label: "Enriching", tone: "pending" },
  REVIEW_REQUIRED: { label: "Review required", tone: "pending" },
  APPROVED: { label: "Approved", tone: "pending" },
  PROCESSING: { label: "Sending", tone: "pending" },
  SENT: { label: "Sent", tone: "success" },
  REPLIED: { label: "Replied", tone: "success" },
  BOUNCED: { label: "Bounced", tone: "danger" },
  RETRYABLE_FAILED: { label: "Retrying", tone: "danger" },
  PERMANENT_FAILED: { label: "Failed", tone: "danger" },
  DO_NOT_CONTACT: { label: "Do not contact", tone: "neutral" },
};
