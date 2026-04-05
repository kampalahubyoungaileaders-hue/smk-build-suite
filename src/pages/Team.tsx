import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Phone, FolderKanban } from "lucide-react";

const ROLE_COLORS: Record<string, string> = { admin: "bg-primary/10 text-primary", project_manager: "bg-blue-100 text-blue-700", site_supervisor: "bg-yellow-100 text-yellow-700", contractor: "bg-green-100 text-green-700", viewer: "bg-muted text-muted-foreground" };

const Team = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignForm, setAssignForm] = useState({ user_id: "", project_id: "", role: "member" });

  const fetchAll = async () => {
    const [prRes, rolesRes, tmRes, pRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("*"),
      supabase.from("team_members").select("*, projects(name)"),
      supabase.from("projects").select("id, name"),
    ]);
    setProfiles(prRes.data || []);
    setRoles(rolesRes.data || []);
    setTeamAssignments(tmRes.data || []);
    setProjects(pRes.data || []);
  };

  useEffect(() => { fetchAll(); }, []);

  const getUserRole = (userId: string) => { const r = roles.find((ro) => ro.user_id === userId); return r?.role || "viewer"; };
  const getUserAssignments = (userId: string) => teamAssignments.filter((t) => t.user_id === userId);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignLoading(true);
    const { error } = await supabase.from("team_members").insert({ user_id: assignForm.user_id, project_id: assignForm.project_id, role: assignForm.role });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Team member assigned" }); setAssignOpen(false); setAssignForm({ user_id: "", project_id: "", role: "member" }); fetchAll(); }
    setAssignLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-foreground">Team</h2><p className="text-sm text-muted-foreground">{profiles.length} members</p></div>
          <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
            <DialogTrigger asChild><Button className="bg-primary text-primary-foreground hover:bg-navy-light font-semibold"><Plus size={16} className="mr-1.5" /> Assign to Project</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Assign Team Member</DialogTitle></DialogHeader>
              <form onSubmit={handleAssign} className="space-y-3">
                <div className="space-y-1.5"><Label>Team Member *</Label><Select value={assignForm.user_id} onValueChange={(v) => setAssignForm({ ...assignForm, user_id: v })}><SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger><SelectContent>{profiles.map((p) => (<SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.user_id}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label>Project *</Label><Select value={assignForm.project_id} onValueChange={(v) => setAssignForm({ ...assignForm, project_id: v })}><SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger><SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label>Project Role</Label><Input value={assignForm.role} onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })} placeholder="e.g. Lead Engineer, Foreman" /></div>
                <Button type="submit" disabled={assignLoading || !assignForm.user_id || !assignForm.project_id} className="w-full bg-primary text-primary-foreground font-semibold">{assignLoading ? "Assigning..." : "Assign"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {profiles.length === 0 ? <Card className="p-8 text-center text-muted-foreground">No team members yet</Card> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => {
              const role = getUserRole(p.user_id);
              const assignments = getUserAssignments(p.user_id);
              return (
                <Card key={p.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{(p.full_name || "?").charAt(0).toUpperCase()}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-foreground truncate">{p.full_name || "Unnamed"}</div>
                      <Badge className={`text-[10px] mt-1 ${ROLE_COLORS[role] || ROLE_COLORS.viewer}`}>{role.replace("_", " ")}</Badge>
                    </div>
                  </div>
                  {p.phone && <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><Phone size={12} /> {p.phone}</div>}
                  {assignments.length > 0 ? (
                    <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Project Assignments</div>
                      {assignments.map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-foreground"><FolderKanban size={11} className="text-muted-foreground" />{(a.projects as any)?.name}</span>
                          <span className="text-muted-foreground">{a.role}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-border"><p className="text-xs text-muted-foreground">Not assigned to any projects</p></div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Team;
