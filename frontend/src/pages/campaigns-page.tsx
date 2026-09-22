import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockCampaigns, mockPipelineRecipients } from "@/data/mock-pipeline";
import type { Campaign, CampaignStatus } from "@/types/pipeline";
import { motion, AnimatePresence } from "framer-motion";

import { activateCampaign } from "@/lib/api";

const STATUS_VARIANT: Record<CampaignStatus, "default" | "success" | "warning"> = {
  DRAFT: "default",
  ACTIVE: "success",
  PAUSED: "warning",
  COMPLETED: "default",
  CANCELLED: "default",
};

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const cached = localStorage.getItem('cached_campaigns');
      if (cached) {
        return [...JSON.parse(cached), ...mockCampaigns];
      }
    } catch (e) {
      console.error(e);
    }
    return mockCampaigns;
  });
  const [activating, setActivating] = useState<string | null>(null);

  async function activate(campaignId: string) {
    setActivating(campaignId);
    try {
      await activateCampaign(campaignId);
      
      // Update local React state
      setCampaigns((prev) =>
        prev.map((c) => (c.campaign_id === campaignId ? { ...c, status: "ACTIVE" } : c)),
      );

      // Persist the activated status in localStorage so it survives refresh
      try {
        const cached = localStorage.getItem('cached_campaigns');
        if (cached) {
          const parsed = JSON.parse(cached);
          const updated = parsed.map((c: any) => c.campaign_id === campaignId ? { ...c, status: "ACTIVE" } : c);
          localStorage.setItem('cached_campaigns', JSON.stringify(updated));
        }
      } catch (e) { console.error(e); }
    } catch (err: any) {
      console.error("Failed to activate campaign:", err);
      alert(`Backend operation failed: ${err.message}`);
    } finally {
      setActivating(null);
    }
  }

  return (
    <motion.div 
      className="flex h-screen flex-1 flex-col relative z-10"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader title="Campaigns Management" meta={`${campaigns.length} total orchestrations`} />

      <div className="flex-1 overflow-y-auto p-8 bg-transparent">
        <motion.div 
          className="flex flex-col gap-4 max-w-4xl"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {campaigns.map((campaign) => {
              const recipientCount = mockPipelineRecipients.filter(
                (r) => r.campaign_id === campaign.campaign_id,
              ).length;

              return (
                <motion.div
                  key={campaign.campaign_id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className="glass-card">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex gap-4 items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center glow-primary bg-gradient-to-br from-primary/30 to-accent/30 border border-white/10`}>
                          <span className="text-sm font-bold text-white capitalize">{campaign.domain[0]}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="text-lg font-bold capitalize text-white/95">
                              {campaign.domain}
                            </p>
                            <Badge variant={STATUS_VARIANT[campaign.status]}>{campaign.status}</Badge>
                          </div>
                          <p className="mt-1.5 text-[13px] text-muted-foreground font-medium flex items-center gap-2">
                            {recipientCount} recipient{recipientCount === 1 ? "" : "s"} 
                            <span className="w-1 h-1 rounded-full bg-white/20" /> 
                            limit {campaign.daily_limit} / day
                          </p>
                        </div>
                      </div>

                      {campaign.status === "DRAFT" || campaign.status === "PAUSED" ? (
                        <Button 
                          size="sm" 
                          variant="default" 
                          onClick={() => activate(campaign.campaign_id)}
                          disabled={activating === campaign.campaign_id}
                        >
                          {activating === campaign.campaign_id ? "Activating..." : "Activate Pipeline"}
                        </Button>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground/80">
                            Created
                          </span>
                          <span className="text-sm font-medium text-white/70">
                            {new Date(campaign.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
