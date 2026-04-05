import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
  ChevronRight,
} from "lucide-react";
import smkLogo from "@/assets/smk-logo.jpeg";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Tasks", href: "/dashboard/tasks", icon: ListTodo },
  { label: "Finance", href: "/dashboard/finance", icon: Wallet },
  { label: "Team", href: "/dashboard/team", icon: Users },
  { label: "Reports", href: "/dashboard/reports", icon: FileBarChart },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage = navItems.find(
    (n) => location.pathname === n.href || location.pathname.startsWith(n.href + "/")
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-primary text-primary-foreground flex flex-col transform transition-transform lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-primary-foreground/10">
          <img src={smkLogo} alt="SMK" className="h-9 w-9 rounded object-cover" />
          <div className="min-w-0">
            <div className="font-bold text-sm leading-tight truncate">SMK Technical</div>
            <div className="text-[11px] text-primary-foreground/50 leading-tight">Construction Management</div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-primary-foreground/10">
          <div className="text-[11px] text-primary-foreground/40 mb-1.5 px-3 truncate">
            {user?.email}
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 w-full transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 bg-background border-b border-border px-4 h-14 flex items-center gap-3 lg:px-6">
          <button
            className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground hidden sm:inline">SMK</span>
            {currentPage && (
              <>
                <ChevronRight size={14} className="text-muted-foreground hidden sm:inline" />
                <span className="font-semibold text-foreground">{currentPage.label}</span>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
