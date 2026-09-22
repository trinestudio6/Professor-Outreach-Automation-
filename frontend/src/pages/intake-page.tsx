import { useState, useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { User, Mail, UploadCloud, GraduationCap, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitIntake, startDiscovery } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export function IntakePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const domain = formData.get("domain") as string;
    const name = formData.get("full_name") as string;
    const email = formData.get("email") as string;

    if (!file) {
      setError("Please attach a PDF CV.");
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = new FormData();
      submissionData.append("data", file); 
      submissionData.append("full_name", name);
      submissionData.append("email", email);
      submissionData.append("domain", domain);

      const result = await submitIntake(submissionData);
      
      // Auto-trigger the Discovery workflow on the n8n backend using the returned event_id
      if (result.candidate_id || result.event_id) {
        try {
          const discoveryResult = await startDiscovery(result.candidate_id || result.event_id, domain, 3);
          if (discoveryResult?.campaign_id) {
            const cachedParams = localStorage.getItem('cached_campaigns');
            const cachedList = cachedParams ? JSON.parse(cachedParams) : [];
            cachedList.unshift({
              campaign_id: discoveryResult.campaign_id,
              candidate_id: result.candidate_id || result.event_id,
              domain: domain,
              status: "DRAFT",
              created_at: new Date().toISOString(),
              daily_limit: 10
            });
            localStorage.setItem('cached_campaigns', JSON.stringify(cachedList));
          }
        } catch (e) {
          console.error("Discovery auto-trigger failed:", e);
        }
      }

      setSuccess(true);
      if (formRef.current) formRef.current.reset();
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to kick off intake. Ensure your backend is listening.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  }

  return (
    <motion.div 
      className="flex h-screen flex-1 flex-col relative z-10"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader title="Candidate Intake" meta="Add a new PhD aspirant to the pipeline" />

      <div className="flex-1 overflow-y-auto p-8 bg-transparent flex justify-center items-start pt-12">
        <motion.div 
          className="w-full max-w-xl glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden bg-card/60"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="absolute top-0 inset-x-0 h-1 backdrop-blur-md opacity-30 bg-primary" />
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">New Candidate Profile</h2>
            <p className="text-muted-foreground text-sm">Upload their base CV to begin the automated discovery and enrichment workflows.</p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="h-16 w-16 mb-4 rounded-full bg-green-500/20 flex items-center justify-center glow-primary">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Intake Received</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-8">
                  The candidate is now in the backend pipeline. AI Discovery will begin shortly.
                </p>
                <Button variant="default" onClick={() => setSuccess(false)}>
                  Submit Another
                </Button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                ref={formRef}
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                        <input required name="full_name" type="text" className="w-full bg-black/20 border border-white/10 rounded-md pl-10 pr-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none" placeholder="Jane Doe" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                        <input required name="email" type="email" className="w-full bg-black/20 border border-white/10 rounded-md pl-10 pr-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none" placeholder="jane@example.com" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Domain</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                      <input required name="domain" type="text" className="w-full bg-black/20 border border-white/10 rounded-md pl-10 pr-3 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none" placeholder="e.g. Power Electronics" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Base CV (PDF)</label>
                    
                    <div className="relative">
                      <input 
                        type="file" 
                        name="data" 
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        required 
                      />
                      <div className={`p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${file ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-black/20 hover:border-white/20'}`}>
                        <UploadCloud className={`h-8 w-8 mb-3 ${file ? 'text-primary' : 'text-muted-foreground/50'}`} />
                        <p className="text-sm font-medium text-white/80">
                          {file ? file.name : "Click or drag to upload Base CV"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF up to 10MB"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-10 px-8">
                    {isSubmitting ? "Uploading Pipeline..." : (
                      <>
                        Launch Discovery <ChevronRight className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
