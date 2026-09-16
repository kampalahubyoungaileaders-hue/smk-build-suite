import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Wallet,
  Users,
  FileBarChart,
  LogOut,
  Menu,
  X,
  UserCircle,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { appRole } from "@/lib/status";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Tasks", href: "/dashboard/tasks", icon: ListTodo },
  { label: "Finance", href: "/dashboard/finance", icon: Wallet },
  { label: "Team", href: "/dashboard/team", icon: Users },
  { label: "Reports", href: "/dashboard/reports", icon: FileBarChart },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user, profile, role } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => setSidebarOpen(false), [location.pathname]);

  useEffect(() => {
    const current = [...navItems].reverse().find((n) => location.pathname.startsWith(n.href));
    document.title = `${current?.label ?? "Account"} · SMK Management`;
  }, [location.pathname]);

  const displayName = profile?.full_name || user?.email || "";

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar print:hidden text-sidebar-foreground transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <Logo tone="light" markClassName="h-9" />
            <span className="border-l border-white/20 pl-3 font-display text-[15px] font-semibold leading-tight">
              Project
              <br />
              management
            </span>
          </Link>
          <button
            className="rounded p-1.5 text-white/80 hover:bg-sidebar-accent lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-white before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-smk-red-light"
                    : "text-white/75 hover:bg-sidebar-accent/60 hover:text-white",
                )
              }
            >
              <item.icon size={18} aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <NavLink
            to="/dashboard/account"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-sidebar-accent/60",
                isActive && "bg-sidebar-accent",
              )
            }
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
              {initials(displayName)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-white">{displayName}</span>
              <span className="block truncate text-xs text-white/70">{appRole.label(role)}</span>
            </span>
          </NavLink>
          <button
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 transition-colors hover:bg-sidebar-accent/60 hover:text-white"
          >
            <LogOut size={16} aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-navy-dark/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 print:hidden items-center gap-3 border-b bg-card/95 px-4 backdrop-blur lg:px-8">
          <button
            className="-ml-1 rounded-md p-2 text-foreground hover:bg-muted lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/dashboard" className="lg:hidden">
            <Logo markClassName="h-7" />
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground sm:flex"
            >
              <ExternalLink size={14} aria-hidden /> Company website
            </Link>
            <Link
              to="/dashboard/account"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Your account"
            >
              <UserCircle size={20} />
            </Link>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
