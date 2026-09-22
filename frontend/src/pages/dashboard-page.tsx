import { Link } from "react-router-dom";
import { ArrowRight, Activity, Send, ListTodo, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusDot } from "@/components/shared/status-dot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCampaigns, mockPipelineRecipients } from "@/data/mock-pipeline";
import { STATUS_META } from "@/lib/status";
import { motion, Variants } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const NEEDS_ATTENTION = new Set(["BOUNCED", "RETRYABLE_FAILED", "PERMANENT_FAILED"]);

const chartData = [
  { name: 'Mon', sent: 4, review: 2 },
  { name: 'Tue', sent: 3, review: 4 },
  { name: 'Wed', sent: 7, review: 1 },
  { name: 'Thu', sent: 5, review: 6 },
  { name: 'Fri', sent: 2, review: 8 },
  { name: 'Sat', sent: 9, review: 3 },
  { name: 'Sun', sent: 11, review: 0 },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function DashboardPage() {
  const activeCampaigns = mockCampaigns.filter((c) => c.status === "ACTIVE").length;
  const awaitingReview = mockPipelineRecipients.filter((r) => r.status === "REVIEW_REQUIRED");
  const sent = mockPipelineRecipients.filter((r) => r.status === "SENT" || r.status === "REPLIED").length;
  const needsAttention = mockPipelineRecipients.filter((r) => NEEDS_ATTENTION.has(r.status));

  return (
    <motion.div 
      className="flex h-screen flex-1 flex-col overflow-hidden relative z-10"
      initial="hidden" animate="visible" variants={containerVariants}
    >
      <PageHeader title="Command Center" />

      <div className="flex-1 overflow-y-auto p-8 bg-transparent">
        <motion.div className="grid grid-cols-4 gap-6" variants={containerVariants}>
          {[
            { title: "Active Campaigns", value: activeCampaigns, icon: Activity, color: "text-primary" },
            { title: "Awaiting Review", value: awaitingReview.length, icon: ListTodo, color: "text-accent" },
            { title: "Total Sent", value: sent, icon: Send, color: "text-success" },
            { title: "Needs Attention", value: needsAttention.length, icon: AlertCircle, color: "text-destructive" },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="hover:scale-[1.02] transition-transform duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="mt-8 grid grid-cols-3 gap-6" variants={containerVariants}>
          
          <motion.div className="col-span-2" variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="sent" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div className="col-span-1 space-y-6 flex flex-col" variants={itemVariants}>
            <Card className="flex-1">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b border-white/5">
                <CardTitle>Needs Review</CardTitle>
                {awaitingReview.length > 0 && (
                  <Link to="/review" className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-accent hover:text-accent/80 transition-colors">
                    Queue <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </CardHeader>
              <CardContent className="pt-4 flex flex-col gap-3">
                {awaitingReview.length === 0 ? (
                  <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground border border-dashed border-white/10 rounded-lg bg-white/5">
                    No pending items.
                  </div>
                ) : (
                  awaitingReview.slice(0, 4).map((r) => (
                    <motion.div key={r.recipient_id} whileHover={{ x: 4 }} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="truncate text-sm font-semibold text-white/90">{r.professor_name}</p>
                        <p className="truncate text-xs text-muted-foreground">{r.university}</p>
                      </div>
                      <StatusDot tone={STATUS_META[r.status].tone} label={STATUS_META[r.status].label} />
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

        </motion.div>
      </div>
    </motion.div>
  );
}
