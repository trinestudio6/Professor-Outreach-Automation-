import type { RecipientStatus } from "@/lib/status";

export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export interface Campaign {
  campaign_id: string;
  domain: string;
  status: CampaignStatus;
  daily_limit: number;
  created_at: string;
}

/**
 * A recipient row for pipeline/table views — broader than PendingRecipient,
 * since it must represent every state, not just REVIEW_REQUIRED.
 *
 * No workflow currently exposes a "list all recipients" or "list campaigns"
 * endpoint (see the open-gaps discussion in project history) — this type
 * and the sample data using it exist to make Pipeline/Recipients/Dashboard
 * demonstrable, not to claim the data is live. Wire a real aggregation
 * endpoint before treating this as production data.
 */
export interface PipelineRecipient {
  recipient_id: string;
  campaign_id: string;
  professor_name: string;
  university: string;
  status: RecipientStatus;
  sent_at: string | null;
  last_error_message: string | null;
}
