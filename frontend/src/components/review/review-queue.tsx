import { useState, useEffect } from "react";
import { Inbox } from "lucide-react";
import type { PendingRecipient } from "@/types/recipient";
import { RecipientListItem } from "@/components/review/recipient-list-item";
import { RecipientDetail } from "@/components/review/recipient-detail";
import { PageHeader } from "@/components/shared/page-header";
import { motion, AnimatePresence } from "framer-motion";
import { fetchReviewQueue, approveDraft, rejectDraft } from "@/lib/api";

export function ReviewQueue() {
  const [recipients, setRecipients] = useState<PendingRecipient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadQueue() {
      try {
        const data = await fetchReviewQueue();
        const results = data?.recipients || [];
        setRecipients(results);
        if (results.length > 0) setSelectedId(results[0].recipient_id);
      } catch (err: any) {
        console.error(err);
        setRecipients([]);
        setSelectedId(null);
      }
    }
    loadQueue();
  }, []);

  const selected = recipients.find((r) => r.recipient_id === selectedId) ?? null;

  async function handleDecision(recipientId: string, action: 'approve' | 'reject') {
    setProcessingId(recipientId);
    try {
      if (action === 'approve') {
         await approveDraft(recipientId); 
      } else {
         await rejectDraft(recipientId); 
      }
      
      setRecipients((prev) => {
        const next = prev.filter((r) => r.recipient_id !== recipientId);
        setSelectedId(next[0]?.recipient_id ?? null);
        return next;
      });
    } catch (err: any) {
      console.error(`Failed to ${action} draft:`, err);
      alert(`Backend operation failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <motion.div 
      className="flex h-screen flex-1 flex-col relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader
        title="Review Queue"
        meta={`${recipients.length} DRAFT${recipients.length === 1 ? "" : "S"} AWAITING APPROVAL`}
      />

      {recipients.length === 0 ? (
        <motion.div 
          className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 glowing-pulse">
            <Inbox className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-lg font-bold text-white tracking-tight">Nothing pending review</p>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
              New drafts will appear here once AI discovery and CV enrichment pipelines finish.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <motion.div 
            className="w-80 shrink-0 overflow-y-auto border-r border-white/5 bg-black/20 backdrop-blur-md custom-scrollbar"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <AnimatePresence>
              {recipients.map((recipient) => (
                <motion.div
                  key={recipient.recipient_id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                >
                  <RecipientListItem
                    recipient={recipient}
                    selected={recipient.recipient_id === selectedId}
                    onSelect={() => setSelectedId(recipient.recipient_id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="flex-1 overflow-hidden bg-transparent">
            <AnimatePresence mode="wait">
              {selected && (
                <motion.div
                  key={selected.recipient_id}
                  className="h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <RecipientDetail
                    recipient={selected}
                    processing={processingId === selected.recipient_id}
                    onApprove={() => handleDecision(selected.recipient_id, 'approve')}
                    onReject={() => handleDecision(selected.recipient_id, 'reject')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}
