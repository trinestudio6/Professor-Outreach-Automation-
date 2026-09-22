import { PageHeader } from "@/components/shared/page-header";
import { StatusDot } from "@/components/shared/status-dot";
import { mockPipelineRecipients } from "@/data/mock-pipeline";
import { RECIPIENT_STATUS_ORDER, STATUS_META } from "@/lib/status";
import { motion } from "framer-motion";

export function PipelinePage() {
  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden relative z-10">
      <PageHeader title="Pipeline Board" meta={`${mockPipelineRecipients.length} total recipients in funnel`} />

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-transparent">
        <motion.div 
          className="flex h-full gap-6 pb-4"
          initial="hidden" animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          {RECIPIENT_STATUS_ORDER.map((status) => {
            const items = mockPipelineRecipients.filter((r) => r.status === status);
            const meta = STATUS_META[status];

            return (
              <motion.div
                key={status}
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
                className="flex h-full w-[300px] shrink-0 flex-col rounded-xl glass-panel relative overflow-hidden"
              >
                {/* Subtle top glow based on status */}
                <div className={`absolute top-0 inset-x-0 h-1 backdrop-blur-md opacity-50 ${meta.tone === 'success' ? 'bg-success' : meta.tone === 'pending' ? 'bg-warning' : meta.tone === 'danger' ? 'bg-destructive' : 'bg-primary'}`} />

                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 bg-black/10">
                  <StatusDot tone={meta.tone} label={meta.label} />
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70">{items.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {items.length === 0 ? (
                    <div className="h-24 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
                      <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider">Empty</p>
                    </div>
                  ) : (
                    items.map((r, i) => (
                      <motion.div
                        layoutId={`card-${r.recipient_id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={r.recipient_id}
                        className="rounded-lg border border-white/5 bg-card/60 px-3 py-3 shadow-lg hover:border-white/20 transition-all hover:-translate-y-0.5 hover:shadow-xl cursor-grab active:cursor-grabbing backdrop-blur-sm"
                      >
                        <p className="truncate text-sm font-semibold text-white/90">
                          {r.professor_name}
                        </p>
                        <p className="truncate text-[11px] font-medium text-muted-foreground mt-0.5">{r.university}</p>
                        {r.last_error_message && (
                          <div className="mt-2 p-1.5 rounded bg-destructive/10 border border-destructive/20">
                            <p className="truncate text-[10px] uppercase font-bold tracking-wider text-destructive">
                              Warning: {r.last_error_message}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
