/**
 * Mirrors the response shape of GET /v2-reviews-list from
 * ../../workflows/05-recipient-review.json. Keep this in sync with that
 * workflow's query — it is the actual contract, not this file.
 */
export interface PendingRecipient {
  recipient_id: string;
  campaign_id: string;
  professor_name: string;
  professor_email: string;
  university: string;
  canonical_profile_url: string;
  research_interest: string | null;
  evidence_json: { source_urls?: string[] } | null;
  draft_subject: string;
  draft_html_body: string;
  draft_cv_object_key: string;
  enriched_at: string | null;
}

export type ReviewAction = "approved" | "rejected";
