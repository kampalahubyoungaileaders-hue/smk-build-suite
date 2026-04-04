import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

const statusOptions = ["todo", "in_progress", "completed", "blocked"];
const priorityOptions = ["low", "medium", "high", "critical"];

const statusColors: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-accent/10 text-accent",
  completed: "bg-green-100 text-green-800",
  blocked: "bg-destructive/10 text-destructive",
};

const priorityColors: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-foreground",
  high: "text-accent",
  critical: "text-destructive font-bold",
};

const Tasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    project_id: "",
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
  });

  const fetchData = async () => {
    const [tasksRes, projectsRes] = await Promise.all([
      supabase.from("project_tasks").select("*, projects(name)").order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name"),
    ]);
    setTasks(tasksRes.data || []);
    setProjects(projectsRes.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("project_tasks").insert({
      project_id: form.project_id,
      title: form.title,
      description: form.description || null,
      status: form.status as any,
      priority: form.priority as any,
      due_date: form.due_date || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task created" });
      setOpen(false);
      setForm({ project_id: "", title: "", description: "", status: "todo", priority: "medium", due_date: "" });
      fetchData();
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Tasks</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-smk-red-dark font-semibold">
                <Plus size={16} className="mr-1" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1">
                  <Label>Project</Label>
                  <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                  <div className="space-y-1">
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Due Date</Label>
                  <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <Button type="submit" disabled={loading || !form.project_id} className="w-full bg-accent text-accent-foreground hover:bg-smk-red-dark font-semibold">
                  {loading ? "Creating..." : "Create Task"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {tasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No tasks yet. Create a project first, then add tasks.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <Card key={t.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-foreground">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {(t.projects as any)?.name} {t.due_date ? `· Due: ${t.due_date}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${priorityColors[t.priority] || ""}`}>{t.priority}</span>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[t.status] || ""}`}>
                    {t.status?.replace("_", " ")}
                  </span>
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
