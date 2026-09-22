import type { PendingRecipient } from "@/types/recipient";

/**
 * Sample data shaped exactly like a real GET /v2-reviews-list response.
 * Replace with a live fetch once real auth exists — see
 * src/components/review/review-queue.tsx for the TODO marking where.
 */
export const mockRecipients: PendingRecipient[] = [
  {
    recipient_id: "1f8a1e2e-0a3d-4b7a-9c2e-6a2e1a9b0c11",
    campaign_id: "b0000000-0000-4000-8000-000000000001",
    professor_name: "Elena Vasquez",
    professor_email: "e.vasquez@university.edu",
    university: "Stanford University",
    canonical_profile_url: "https://ee.stanford.edu/faculty/vasquez",
    research_interest: "wide-bandgap power converters",
    evidence_json: { source_urls: ["https://ee.stanford.edu/faculty/vasquez"] },
    draft_subject: "Prospective PhD applicant — GaN converter control",
    draft_html_body:
      "<p>Dear Professor Vasquez, I'm writing to express my interest in your lab's work on wide-bandgap power converter control, particularly your 2025 paper on adaptive gate-drive timing for GaN devices. My undergraduate thesis at BUET focused on power-quality disturbance detection using optimized SVM and PNN classifiers, and I believe this background aligns closely with the control-theoretic side of your group's research. I have attached my CV and would welcome the opportunity to discuss potential PhD openings for the coming cycle.</p>",
    draft_cv_object_key: "candidates/e1793c74-43f2-4603-bb02-5b5a232c4ea1/base-cv.pdf",
    enriched_at: "2026-09-17T09:14:00Z",
  },
  {
    recipient_id: "2f8a1e2e-0a3d-4b7a-9c2e-6a2e1a9b0c22",
    campaign_id: "b0000000-0000-4000-8000-000000000001",
    professor_name: "Marcus Chen",
    professor_email: "m.chen@university.edu",
    university: "University of Michigan",
    canonical_profile_url: "https://eecs.umich.edu/faculty/chen-marcus",
    research_interest: "microgrid stability and inverter control",
    evidence_json: { source_urls: ["https://eecs.umich.edu/faculty/chen-marcus"] },
    draft_subject: "Prospective PhD applicant — microgrid power quality",
    draft_html_body:
      "<p>Dear Professor Chen, Your lab's recent work on three-phase inverter modes with changeable conduction states caught my attention, particularly its relevance to microgrid resilience. I published an IEEE conference paper on a related inverter topology during my undergraduate studies, and my thesis addressed power-quality disturbance detection in microgrids. I would be glad to share more detail on this work and discuss whether it aligns with open positions in your group.</p>",
    draft_cv_object_key: "candidates/e1793c74-43f2-4603-bb02-5b5a232c4ea1/base-cv.pdf",
    enriched_at: "2026-09-17T09:22:00Z",
  },
  {
    recipient_id: "3f8a1e2e-0a3d-4b7a-9c2e-6a2e1a9b0c33",
    campaign_id: "b0000000-0000-4000-8000-000000000001",
    professor_name: "Amara Osei",
    professor_email: "a.osei@university.edu",
    university: "Georgia Institute of Technology",
    canonical_profile_url: "https://ece.gatech.edu/faculty/osei",
    research_interest: "machine learning for fault classification in power systems",
    evidence_json: { source_urls: ["https://ece.gatech.edu/faculty/osei"] },
    draft_subject: "Prospective PhD applicant — ML-based fault classification",
    draft_html_body:
      "<p>Dear Professor Osei, I'm reaching out regarding potential PhD openings in your group. My undergraduate thesis applied optimized SVM and PNN classifiers to power-quality disturbance detection in microgrids, which overlaps directly with your group's work on learned fault-classification pipelines. I have technical experience in MATLAB/Simulink, Python, and embedded C, and would welcome the chance to discuss my background further.</p>",
    draft_cv_object_key: "candidates/e1793c74-43f2-4603-bb02-5b5a232c4ea1/base-cv.pdf",
    enriched_at: "2026-09-17T10:05:00Z",
  },
];
