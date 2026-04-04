import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  location: string | null;
  client_name: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  progress: number;
  created_at: string;
}

const statusOptions = ["planning", "in_progress", "on_hold", "completed", "cancelled"];

const statusColors: Record<string, string> = {
  planning: "bg-muted text-muted-foreground",
  in_progress: "bg-accent/10 text-accent",
  on_hold: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-destructive/10 text-destructive",
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "planning",
    location: "",
    client_name: "",
    budget: "",
    start_date: "",
    end_date: "",
  });

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects((data as Project[]) || []);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("projects").insert({
      name: form.name,
      description: form.description || null,
      status: form.status as any,
      location: form.location || null,
      client_name: form.client_name || null,
      budget: form.budget ? Number(form.budget) : 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      created_by: user?.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Project created" });
      setOpen(false);
      setForm({ name: "", description: "", status: "planning", location: "", client_name: "", budget: "", start_date: "", end_date: "" });
      fetchProjects();
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Projects</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-smk-red-dark font-semibold">
                <Plus size={16} className="mr-1" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1">
                  <Label>Project Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Client</Label>
                    <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Location</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Budget (UGX)</Label>
                    <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Start Date</Label>
                    <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>End Date</Label>
                    <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-smk-red-dark font-semibold">
                  {loading ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No projects yet. Click "New Project" to create one.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Card key={p.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-foreground">{p.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[p.status] || ""}`}>
                    {p.status?.replace("_", " ")}
                  </span>
                </div>
                {p.description && <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                <div className="text-xs text-muted-foreground space-y-1">
                  {p.client_name && <div>Client: {p.client_name}</div>}
                  {p.location && <div>Location: {p.location}</div>}
                  <div>Budget: UGX {Number(p.budget).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{p.progress}%</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
