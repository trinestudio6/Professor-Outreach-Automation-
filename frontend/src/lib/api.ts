import { supabase } from "@/lib/supabase";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://n8n.trinism.tech/webhook";

async function getAuthHeaders(includeContentType = true) {
  const { data: { session } } = await supabase.auth.getSession();
  const ownerId = session?.user?.id || import.meta.env.VITE_DEFAULT_OWNER_ID || "test-owner-id";
  
  const headers: Record<string, string> = {
    "x-owner-id": ownerId
  };
  
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
}

export async function fetchReviewQueue() {
  const response = await fetch(`${API_BASE}/v2-reviews-list`, {
    headers: await getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  return response.json();
}

export async function approveDraft(recipientId: string) {
  const response = await fetch(`${API_BASE}/v2-reviews-approve`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ recipient_id: recipientId }),
  });
  if (!response.ok && response.status !== 409) {
    throw new Error(`Failed to approve draft: ${response.statusText}`);
  }
}

export async function rejectDraft(recipientId: string) {
  const response = await fetch(`${API_BASE}/v2-reviews-reject`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ recipient_id: recipientId }),
  });
  if (!response.ok && response.status !== 409) {
    throw new Error(`Failed to reject draft: ${response.statusText}`);
  }
}

export async function activateCampaign(campaignId: string) {
  const response = await fetch(`${API_BASE}/v2-campaigns-activate`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ campaign_id: campaignId }),
  });
  if (!response.ok && response.status !== 409) {
    throw new Error(`Failed to activate campaign: ${response.statusText}`);
  }
}

export async function submitIntake(formData: FormData): Promise<any> {
  const headers = await getAuthHeaders(false);
  const response = await fetch(`${API_BASE}/v2-candidate-intake`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Failed to submit intake form: ${response.statusText}`);
  }
  return response.json();
}

export async function startDiscovery(candidateId: string, domain: string, limit: number = 3) {
  const response = await fetch(`${API_BASE}/v2-campaign-discovery`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      candidate_id: candidateId,
      domain: domain,
      limit: limit
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to trigger discovery: ${response.statusText}`);
  }
  return response.json();
}
