import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "project_manager" | "site_supervisor" | "contractor" | "viewer";

const ROLE_RANK: AppRole[] = ["admin", "project_manager", "site_supervisor", "contractor", "viewer"];

export interface Permissions {
  /** Has any role at all — i.e. an admin has approved this account */
  isStaff: boolean;
  isAdmin: boolean;
  manageProjects: boolean;
  deleteProjects: boolean;
  manageTasks: boolean;
  manageBudgets: boolean;
  manageTeam: boolean;
  submitExpenses: boolean;
  approveExpenses: boolean;
  manageInvoices: boolean;
  managePayments: boolean;
  deleteFinance: boolean;
  manageRoles: boolean;
}

const permissionsFor = (role: AppRole | null): Permissions => {
  const admin = role === "admin";
  const pm = admin || role === "project_manager";
  return {
    isStaff: role !== null,
    isAdmin: admin,
    manageProjects: pm,
    deleteProjects: admin,
    manageTasks: pm,
    manageBudgets: pm,
    manageTeam: pm,
    submitExpenses: pm || role === "site_supervisor",
    approveExpenses: pm,
    manageInvoices: pm,
    managePayments: pm,
    deleteFinance: admin,
    manageRoles: admin,
  };
};

interface Profile {
  full_name: string | null;
  phone: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  role: AppRole | null;
  profile: Profile | null;
  can: Permissions;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  role: null,
  profile: null,
  can: permissionsFor(null),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setSessionLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setSessionLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  const loadAccess = useCallback(async () => {
    if (!userId) {
      setRole(null);
      setProfile(null);
      setLoadedFor(null);
      return;
    }
    const [rolesRes, profileRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("full_name, phone").eq("user_id", userId).maybeSingle(),
    ]);
    const roles = (rolesRes.data ?? []).map((r) => r.role as AppRole);
    // If a user somehow has several roles, use the most privileged one.
    setRole(ROLE_RANK.find((r) => roles.includes(r)) ?? null);
    setProfile(profileRes.data ?? null);
    setLoadedFor(userId);
  }, [userId]);

  useEffect(() => {
    loadAccess();
  }, [loadAccess]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      user: session?.user ?? null,
      loading: sessionLoading || (!!userId && loadedFor !== userId),
      role,
      profile,
      can: permissionsFor(role),
      signOut,
      refreshProfile: loadAccess,
    }),
    [session, sessionLoading, userId, loadedFor, role, profile, signOut, loadAccess],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
