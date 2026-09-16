import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Phone, UserPlus, Users, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppRole, useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { AssignMemberDialog } from "@/components/dashboard/forms";
import { ConfirmDelete, EmptyState, LoadingRows, PageHeader, SectionCard, StatusBadge, describeError } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { appRole } from "@/lib/status";
import { formatDate, initials } from "@/lib/format";

import type { Option, Person, Row } from "@/lib/db";
const RANK = appRole.list.map((r) => r.value);

const RoleDescription: Record<string, string> = {
  admin: "Everything, including user access and deleting records",
  project_manager: "Projects, tasks, budgets, invoices, payments, approvals",
  site_supervisor: "Submit expenses and update their own tasks",
  contractor: "Update tasks assigned to them",
  viewer: "Read-only access",
};

const PendingRow = ({ person, onApprove }: { person: Row; onApprove: (role: AppRole) => Promise<void> }) => {
  const [role, setRole] = useState<AppRole>("viewer");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="font-medium text-foreground">{person.full_name || "Unnamed user"}</div>
        <div className="text-sm text-muted-foreground">Signed up {formatDate(person.created_at)}</div>
      </div>
      <div className="flex gap-2">
        <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
          <SelectTrigger className="w-48" aria-label="Role to grant"><SelectValue /></SelectTrigger>
          <SelectContent>{appRole.list.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
        </Select>
        <Button disabled={busy} onClick={async () => { setBusy(true); await onApprove(role); setBusy(false); }}>
          <ShieldCheck /> Give access
        </Button>
      </div>
    </div>
  );
};

const Team = () => {
  const { user, can, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Row[]>([]);
  const [roles, setRoles] = useState<Row[]>([]);
  const [assignments, setAssignments] = useState<Row[]>([]);
  const [projects, setProjects] = useState<Row[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    const [pr, r, tm, p] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("team_members").select("*, projects(name, status)"),
      supabase.from("projects").select("id, name").order("name"),
    ]);
    setProfiles(pr.data ?? []);
    setRoles(r.data ?? []);
    setAssignments(tm.data ?? []);
    setProjects(p.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const roleOf = (uid: string): string | null => {
    const mine = roles.filter((r) => r.user_id === uid).map((r) => r.role);
    return RANK.find((r) => mine.includes(r)) ?? null;
  };

  const staff = profiles.filter((p) => roleOf(p.user_id));
  const pendingUsers = profiles.filter((p) => !roleOf(p.user_id));

  const setRole = async (uid: string, role: AppRole | null, okMsg: string) => {
    const { error } = await supabase.rpc("set_user_role", { _user_id: uid, _role: role });
    if (error) {
      toast({ title: "Couldn't change access", description: describeError(error.message), variant: "destructive" });
      return;
    }
    toast({ title: okMsg });
    if (uid === user?.id) await refreshProfile();
    fetchAll();
  };

  const removeAssignment = async (id: string) => {
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) toast({ title: "Couldn't remove from project", description: describeError(error.message), variant: "destructive" });
    else fetchAll();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Team"
          description={loading ? "Loading…" : `${staff.length} people with access`}
          actions={
            can.manageTeam && (
              <AssignMemberDialog
                open={assignOpen}
                onOpenChange={setAssignOpen}
                projects={projects as Option[]}
                people={staff as Person[]}
                onSaved={fetchAll}
                trigger={<Button disabled={!projects.length || !staff.length}><Plus /> Add to project</Button>}
              />
            )
          }
        />

        {can.manageRoles && pendingUsers.length > 0 && (
          <SectionCard title={`Waiting for access (${pendingUsers.length})`} className="border-l-4 border-l-warning">
            <p className="-mt-2 mb-2 text-sm text-muted-foreground">
              These people created an account but can't see anything yet. Only give access to people you recognise.
            </p>
            <div className="divide-y">
              {pendingUsers.map((p) => (
                <PendingRow key={p.user_id} person={p} onApprove={(role) => setRole(p.user_id, role, `${p.full_name || "User"} can now sign in as ${appRole.label(role)}`)} />
              ))}
            </div>
          </SectionCard>
        )}

        {can.manageRoles && (
          <details className="rounded-lg border bg-card px-4 py-3 text-sm">
            <summary className="cursor-pointer font-medium text-foreground">What each role can do</summary>
            <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
              {appRole.list.map((r) => (
                <div key={r.value} className="contents">
                  <dt className="font-medium text-foreground">{r.label}</dt>
                  <dd className="text-muted-foreground">{RoleDescription[r.value]}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}

        {loading ? (
          <LoadingRows rows={4} />
        ) : staff.length === 0 ? (
          <Card><EmptyState icon={Users} title="No team members yet" /></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staff.map((p) => {
              const role = roleOf(p.user_id)!;
              const mine = assignments.filter((a) => a.user_id === p.user_id);
              const isMe = p.user_id === user?.id;
              return (
                <Card key={p.user_id} className="flex flex-col p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {initials(p.full_name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-lg font-semibold leading-tight text-foreground">
                        {p.full_name || "Unnamed user"}
                        {isMe && <span className="ml-1.5 text-sm font-normal text-muted-foreground">(you)</span>}
                      </div>
                      {p.phone ? (
                        <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                          <Phone size={13} /> {p.phone}
                        </a>
                      ) : (
                        <div className="mt-0.5 text-sm text-muted-foreground">No phone number</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    {can.manageRoles && !isMe ? (
                      <div className="flex gap-2">
                        <Select value={role} onValueChange={(v) => setRole(p.user_id, v as AppRole, `Role changed to ${appRole.label(v)}`)}>
                          <SelectTrigger className="h-9 flex-1" aria-label={`Role for ${p.full_name}`}><SelectValue /></SelectTrigger>
                          <SelectContent>{appRole.list.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <ConfirmDelete
                          title="Remove access?"
                          confirmLabel="Remove access"
                          description={`${p.full_name || "This person"} will be signed out of all project and finance data until an administrator gives access again.`}
                          trigger={<Button variant="outline" size="sm" className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive">Remove</Button>}
                          onConfirm={() => setRole(p.user_id, null, "Access removed")}
                        />
                      </div>
                    ) : (
                      <StatusBadge tone={appRole.tone(role)}>{appRole.label(role)}</StatusBadge>
                    )}
                  </div>

                  <div className="mt-4 border-t pt-3">
                    <div className="mb-1.5 text-sm font-medium text-muted-foreground">Projects</div>
                    {mine.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Not on any project yet</p>
                    ) : (
                      <ul className="space-y-1">
                        {mine.map((a) => (
                          <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                            <Link to={`/dashboard/projects/${a.project_id}`} className="min-w-0 truncate text-foreground hover:text-primary hover:underline">
                              {a.projects?.name}
                            </Link>
                            <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                              {a.role}
                              {can.manageTeam && (
                                <ConfirmDelete title="Remove from project?" confirmLabel="Remove" description={`${p.full_name} will be removed from ${a.projects?.name}.`} onConfirm={() => removeAssignment(a.id)} />
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!can.manageRoles && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserPlus size={15} /> New colleagues can create an account on the sign-in page. An administrator then gives them access here.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Team;
