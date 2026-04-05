import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, MapPin, Calendar } from "lucide-react";

const statusOptions = ["planning", "in_progress", "on_hold", "completed", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  planning: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700",
  on_hold: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-destructive/10 text-destructive",
};

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", description: "", client_name: "", location: "", budget: "", status: "planning", start_date: "", end_date: "" });

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    const list = data || [];
    setProjects(list);
    applyFilters(list, search, statusFilter);
  };

  const applyFilters = (list: any[], q: string, status: string) => {
    let result = list;
    if (q) { const lower = q.toLowerCase(); result = result.filter((p) => p.name?.toLowerCase().includes(lower) || p.client_name?.toLowerCase().includes(lower) || p.location?.toLowerCase().includes(lower)); }
    if (status !== "all") result = result.filter((p) => p.status === status);
    setFiltered(result);
  };

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { applyFilters(projects, search, statusFilter); }, [search, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("projects").insert({ name: form.name, description: form.description || null, client_name: form.client_name || null, location: form.location || null, budget: form.budget ? Number(form.budget) : 0, status: form.status as any, start_date: form.start_date || null, end_date: form.end_date || null, created_by: user?.id });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Project created" }); setOpen(false); setForm({ name: "", description: "", client_name: "", location: "", budget: "", status: "planning", start_date: "", end_date: "" }); fetchProjects(); }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">Projects</h2>
            <p className="text-sm text-muted-foreground">{projects.length} total projects</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-navy-light font-semibold"><Plus size={16} className="mr-1.5" /> New Project</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1.5"><Label>Project Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. SMK Heights Phase 2" /></div>
                <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project scope and details" rows={3} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Client</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Client name" /></div>
                  <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Kampala" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Budget (UGX)</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statusOptions.map((s) => (<SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>))}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
                </div>
                <Button type="submit" disabled={loading || !form.name} className="w-full bg-primary text-primary-foreground hover:bg-navy-light font-semibold">{loading ? "Creating..." : "Create Project"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statusOptions.map((s) => (<SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>))}</SelectContent></Select>
        </div>
        {filtered.length === 0 ? (
          <Card className="p-8 text-center"><p className="text-muted-foreground">No projects found</p></Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <Link key={p.id} to={`/dashboard/projects/${p.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm text-foreground leading-tight flex-1 mr-2">{p.name}</h3>
                    <Badge variant="secondary" className={`text-[10px] shrink-0 ${STATUS_COLORS[p.status] || ""}`}>{p.status?.replace("_", " ")}</Badge>
                  </div>
                  {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>}
                  <div className="mt-auto space-y-2">
                    {(p.client_name || p.location) && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {p.client_name && <span>{p.client_name}</span>}
                        {p.location && <span className="flex items-center gap-0.5"><MapPin size={10} /> {p.location}</span>}
                      </div>
                    )}
                    {p.budget > 0 && <div className="text-xs font-medium text-foreground">UGX {Number(p.budget).toLocaleString()}</div>}
                    <div className="flex items-center gap-2"><Progress value={p.progress || 0} className="h-1.5 flex-1" /><span className="text-[11px] text-muted-foreground font-medium">{p.progress || 0}%</span></div>
                    {(p.start_date || p.end_date) && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar size={10} />
                        {p.start_date && new Date(p.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                        {p.start_date && p.end_date && " - "}
                        {p.end_date && new Date(p.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
