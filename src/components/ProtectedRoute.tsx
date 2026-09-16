import { Navigate } from "react-router-dom";
import { Clock, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";

export const FullScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background" role="status">
    <div className="flex flex-col items-center gap-4">
      <Logo markClassName="h-12" />
      <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  </div>
);

const AwaitingAccess = () => {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <Logo markClassName="h-10" />
        <div className="mt-8 flex items-center gap-2 text-warning">
          <Clock size={18} />
          <span className="text-sm font-semibold">Waiting for approval</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Your account is not active yet</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You're signed in as <span className="font-medium text-foreground">{user?.email}</span>. An SMK
          administrator needs to assign you a role before you can see projects and finances. Ask your
          administrator to open <span className="font-medium text-foreground">Team</span> and approve your
          account, then refresh this page.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => window.location.reload()}>Refresh</Button>
          <Button variant="outline" onClick={signOut}>
            <LogOut /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, can } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!can.isStaff) return <AwaitingAccess />;

  return <>{children}</>;
};

export default ProtectedRoute;
