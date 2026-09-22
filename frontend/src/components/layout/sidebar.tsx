import { NavLink } from "react-router-dom";
import { LayoutDashboard, Inbox, FolderKanban, GitBranch, Users, UserPlus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { supabase } from "@/lib/supabase";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/intake", label: "Candidate Intake", icon: UserPlus, end: false },
  { to: "/review", label: "Review Queue", icon: Inbox, end: false },
  { to: "/campaigns", label: "Campaigns", icon: FolderKanban, end: false },
  { to: "/pipeline", label: "Pipeline", icon: GitBranch, end: false },
  { to: "/recipients", label: "Recipients", icon: Users, end: false },
] as const;

export function Sidebar() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card/40">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <div className="h-2 w-2 rounded-full bg-primary" />
        <span className="text-sm font-medium tracking-tight text-foreground">
          Outreach OS
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/30 px-3 py-2.5">
          <div>
            <p className="text-xs font-medium text-foreground">Signed in as</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground" title={user?.email || "Unknown"}>
              {user?.email || "Test Environment"}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-red-500/80 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-3 w-3" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
