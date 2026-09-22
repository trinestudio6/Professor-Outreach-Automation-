import { HashRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { ReviewQueue } from "@/components/review/review-queue";
import { DashboardPage } from "@/pages/dashboard-page";
import { CampaignsPage } from "@/pages/campaigns-page";
import { PipelinePage } from "@/pages/pipeline-page";
import { RecipientsPage } from "@/pages/recipients-page";
import { IntakePage } from "@/pages/intake-page";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LoginPage } from "@/pages/login-page";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex h-screen w-full bg-background text-foreground">
                <Sidebar />
                <div className="flex-1 overflow-hidden relative">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/intake" element={<IntakePage />} />
                    <Route path="/review" element={<ReviewQueue />} />
                    <Route path="/campaigns" element={<CampaignsPage />} />
                    <Route path="/pipeline" element={<PipelinePage />} />
                    <Route path="/recipients" element={<RecipientsPage />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
