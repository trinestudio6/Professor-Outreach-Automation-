import type { Campaign, PipelineRecipient } from "@/types/pipeline";

/**
 * Sample data standing in for two endpoints that don't exist yet:
 * "list campaigns" and "list all recipients." See the note in
 * src/types/pipeline.ts before wiring this to anything real.
 */
export const mockCampaigns: Campaign[] = [
  {
    campaign_id: "b0000000-0000-4000-8000-000000000001",
    domain: "power electronics",
    status: "ACTIVE",
    daily_limit: 10,
    created_at: "2026-09-15T08:00:00Z",
  },
  {
    campaign_id: "b0000000-0000-4000-8000-000000000002",
    domain: "control systems",
    status: "DRAFT",
    daily_limit: 10,
    created_at: "2026-09-18T11:00:00Z",
  },
];

export const mockPipelineRecipients: PipelineRecipient[] = [
  { recipient_id: "r1", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Diego Fontaine", university: "UC Berkeley", status: "DISCOVERED", sent_at: null, last_error_message: null },
  { recipient_id: "r2", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Priya Raman", university: "Georgia Tech", status: "DISCOVERED", sent_at: null, last_error_message: null },
  { recipient_id: "r3", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Julia Kowalski", university: "ETH Zurich", status: "SELECTED", sent_at: null, last_error_message: null },
  { recipient_id: "r4", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Samuel Okoro", university: "University of Toronto", status: "ENRICHING", sent_at: null, last_error_message: null },
  { recipient_id: "1f8a1e2e-0a3d-4b7a-9c2e-6a2e1a9b0c11", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Elena Vasquez", university: "Stanford University", status: "REVIEW_REQUIRED", sent_at: null, last_error_message: null },
  { recipient_id: "2f8a1e2e-0a3d-4b7a-9c2e-6a2e1a9b0c22", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Marcus Chen", university: "University of Michigan", status: "REVIEW_REQUIRED", sent_at: null, last_error_message: null },
  { recipient_id: "3f8a1e2e-0a3d-4b7a-9c2e-6a2e1a9b0c33", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Amara Osei", university: "Georgia Institute of Technology", status: "REVIEW_REQUIRED", sent_at: null, last_error_message: null },
  { recipient_id: "r5", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Henrik Larsson", university: "KTH Royal Institute", status: "APPROVED", sent_at: null, last_error_message: null },
  { recipient_id: "r6", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Fatima Al-Sayed", university: "Imperial College London", status: "SENT", sent_at: "2026-09-17T14:22:00Z", last_error_message: null },
  { recipient_id: "r7", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Robert Nakamura", university: "University of Tokyo", status: "SENT", sent_at: "2026-09-17T14:24:00Z", last_error_message: null },
  { recipient_id: "r8", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Ingrid Bergström", university: "Chalmers University", status: "REPLIED", sent_at: "2026-09-16T09:10:00Z", last_error_message: null },
  { recipient_id: "r9", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Carlos Mendez", university: "TU Delft", status: "BOUNCED", sent_at: "2026-09-16T09:12:00Z", last_error_message: "550 mailbox unavailable" },
  { recipient_id: "r10", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Wei Zhang", university: "National University of Singapore", status: "RETRYABLE_FAILED", sent_at: null, last_error_message: "429 rate limited, retrying" },
  { recipient_id: "r11", campaign_id: mockCampaigns[0].campaign_id, professor_name: "Anonymous Faculty", university: "Unknown", status: "DO_NOT_CONTACT", sent_at: null, last_error_message: "Opted out" },
];
