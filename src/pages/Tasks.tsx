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
import { Plus, Search, Calendar, List, LayoutGrid } from "lucide-react";

const statusColumns = [
  { key: "todo", label: "To Do", color: "border-muted-foreground/30" },
  { key: "in_progress", label: "In Progress", color: "border-blue-400" },
  { key: "completed", label: "Completed", color: "border-green-500" },
  { key: "blocked", label: "Blocked", color: "border-destructive" },
];
const PRIORITY_COLORS: Record<string, string> = { low: "bg-muted text-muted-foreground", medium: "bg-blue-100 text-blue-700", high: "bg-yellow-100 text-yellow-700", critical: "bg-destructive/10 text-destructive" };

const Tasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ project_id: "", title: "", description: "", priority: "medium", status: "todo", due_date: "", assigned_to: "" });

  const fetchData = async () => {
    const [tRes, pRes, prRes] = await Promise.all([
      supabase.from("project_tasks").select("*, projects(name)").order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name"),
      supabase.from("profiles").select("user_id, full_name"),
    ]);
    setTasks(tRes.data || []);
    setProjects(pRes.data || []);
    setProfiles(prRes.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("project_tasks").insert({ project_id: form.project_id, title: form.title, description: form.description || null, priority: form.priority as any, status: form.status as any, due_date: form.due_date || null, assigned_to: form.assigned_to || null });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Task created" }); setOpen(false); setForm({ project_id: "", title: "", description: "", priority: "medium", status: "todo", due_date: "", assigned_to: "" }); fetchData(); }
    setLoading(false);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await supabase.from("project_tasks").update({ status: newStatus as any }).eq("id", taskId);
    fetchData();
  };

  const filteredTasks = tasks.filter((t) => {
    if (search) { const q = search.toLowerCase(); if (!t.title?.toLowerCase().includes(q) && !(t.projects as any)?.name?.toLowerCase().includes(q)) return false; }
    if (projectFilter !== "all" && t.project_id !== projectFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  const getProfileName = (userId: string) => profiles.find((pr) => pr.user_id === userId)?.full_name || "";

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">Tasks</h2>
            <p className="text-sm text-muted-foreground">{tasks.length} total across all projects</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-border rounded-md">
              <button onClick={() => setViewMode("kanban")} className={`p-1.5 ${viewMode === "kanban" ? "bg-muted" : ""}`}><LayoutGrid size={16} /></button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 ${viewMode === "list" ? "bg-muted" : ""}`}><List size={16} /></button>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="bg-primary text-primary-foreground hover:bg-navy-light font-semibold"><Plus size={16} className="mr-1.5" /> New Task</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
                <form onSubmit={handleCreate} className="space-y-3">
                  <div className="space-y-1.5"><Label>Project *</Label><Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}><SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger><SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent></Select></div>
                  <div className="space-y-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                  <div className="space-y-1.5"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Priority</Label><Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["low", "medium", "high", "critical"].map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select></div>
                    <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Assign To</Label><Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger><SelectContent>{profiles.map((p) => (<SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.user_id}</SelectItem>))}</SelectContent></Select></div>
                  <Button type="submit" disabled={loading || !form.project_id || !form.title} className="w-full bg-primary text-primary-foreground font-semibold">{loading ? "Creating..." : "Create Task"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
          <Select value={projectFilter} onValueChange={setProjectFilter}><SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All projects" /></SelectTrigger><SelectContent><SelectItem value="all">All projects</SelectItem>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent></Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="All priorities" /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{["low", "medium", "high", "critical"].map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select>
        </div>
        {viewMode === "kanban" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusColumns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="space-y-2">
                  <div className={`flex items-center justify-between px-1 pb-2 border-b-2 ${col.color}`}>
                    <span className="text-sm font-semibold text-foreground capitalize">{col.label}</span>
                    <Badge variant="secondary" className="text-[10px]">{colTasks.length}</Badge>
                  </div>
                  {colTasks.length === 0 ? <div className="py-8 text-center text-xs text-muted-foreground">No tasks</div> : (
                    <div className="space-y-2">
                      {colTasks.map((t) => (
                        <Card key={t.id} className="p-3 space-y-2">
                          <div className="font-medium text-sm text-foreground leading-tight">{t.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{(t.projects as any)?.name}</div>
                          <div className="flex items-center justify-between">
                            <Badge className={`text-[10px] ${PRIORITY_COLORS[t.priority] || ""}`}>{t.priority}</Badge>
                            <div className="flex items-center gap-2">
                              {t.due_date && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Calendar size={10} />{new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                              {t.assigned_to && <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{getProfileName(t.assigned_to).charAt(0).toUpperCase() || "?"}</div>}
                            </div>
                          </div>
                          <Select value={t.status} onValueChange={(v) => handleStatusChange(t.id, v)}><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent>{statusColumns.map((s) => (<SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>))}</SelectContent></Select>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.length === 0 ? <Card className="p-8 text-center text-muted-foreground text-sm">No tasks found</Card> : filteredTasks.map((t) => (
              <Card key={t.id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-foreground">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{(t.projects as any)?.name}{t.assigned_to && ` · ${getProfileName(t.assigned_to)}`}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`text-[10px] ${PRIORITY_COLORS[t.priority] || ""}`}>{t.priority}</Badge>
                  {t.due_date && <span className="text-[11px] text-muted-foreground whitespace-nowrap">{new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                  <Select value={t.status} onValueChange={(v) => handleStatusChange(t.id, v)}><SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger><SelectContent>{statusColumns.map((s) => (<SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>))}</SelectContent></Select>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
