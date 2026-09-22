import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusDot } from "@/components/shared/status-dot";
import { mockCampaigns, mockPipelineRecipients } from "@/data/mock-pipeline";
import { RECIPIENT_STATUS_ORDER, STATUS_META, type RecipientStatus } from "@/lib/status";

const ALL = "ALL" as const;

/**
 * TODO(backend): no "list all recipients" endpoint exists yet — see
 * src/types/pipeline.ts.
 */
export function RecipientsPage() {
  const [statusFilter, setStatusFilter] = useState<RecipientStatus | typeof ALL>(ALL);

  const campaignDomain = useMemo(() => {
    const map = new Map(mockCampaigns.map((c) => [c.campaign_id, c.domain]));
    return (campaignId: string) => map.get(campaignId) ?? "—";
  }, []);

  const filtered =
    statusFilter === ALL
      ? mockPipelineRecipients
      : mockPipelineRecipients.filter((r) => r.status === statusFilter);

  return (
    <div className="flex h-screen flex-1 flex-col">
      <PageHeader title="Recipients" meta={`${filtered.length} of ${mockPipelineRecipients.length}`} />

      <div className="flex-1 overflow-y-auto p-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RecipientStatus | typeof ALL)}
          className="mb-4 h-8 rounded-md border border-border bg-muted/30 px-2.5 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value={ALL}>All statuses</option>
          {RECIPIENT_STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_META[status].label}
            </option>
          ))}
        </select>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Professor</th>
                <th className="px-4 py-2.5 font-medium">University</th>
                <th className="px-4 py-2.5 font-medium">Campaign</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.recipient_id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-foreground">{r.professor_name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.university}</td>
                  <td className="px-4 py-2.5 capitalize text-muted-foreground">
                    {campaignDomain(r.campaign_id)}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusDot tone={STATUS_META[r.status].tone} label={STATUS_META[r.status].label} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No recipients in this state.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
