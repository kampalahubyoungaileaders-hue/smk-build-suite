import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700",
  on_hold: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-destructive/10 text-destructive",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-yellow-100 text-yellow-700",
  critical: "bg-destructive/10 text-destructive",
};

const TASK_STATUS_COLORS: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  blocked: "bg-destructive/10 text-destructive",
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit project state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);

  // Add task dialog
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    due_date: "",
  });
  const [taskLoading, setTaskLoading] = useState(false);

  // Add budget dialog
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    description: "",
    estimated_amount: "",
    actual_amount: "",
  });
  const [budgetLoading, setBudgetLoading] = useState(false);

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    const [pRes, tRes, bRes, eRes, tmRes, prRes] = await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase.from("project_tasks").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("project_budgets").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").eq("project_id", id).order("expense_date", { ascending: false }),
      supabase.from("team_members").select("*").eq("project_id", id),
      supabase.from("profiles").select("*"),
    ]);
    setProject(pRes.data);
    setTasks(tRes.data || []);
    setBudgets(bRes.data || []);
    setExpenses(eRes.data || []);
    setTeamMembers(tmRes.data || []);
    setProfiles(prRes.data || []);
    if (pRes.data) {
      setEditForm({
        name: pRes.data.name,
        description: pRes.data.description || "",
        client_name: pRes.data.client_name || "",
        location: pRes.data.location || "",
        budget: pRes.data.budget || 0,
        status: pRes.data.status,
        progress: pRes.data.progress || 0,
        start_date: pRes.data.start_date || "",
        end_date: pRes.data.end_date || "",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    const { error } = await supabase
      .from("projects")
      .update({
        name: editForm.name,
        description: editForm.description || null,
        client_name: editForm.client_name || null,
        location: editForm.location || null,
        budget: Number(editForm.budget) || 0,
        status: editForm.status,
        progress: Number(editForm.progress) || 0,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
      })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Project updated" });
      setEditOpen(false);
      fetchAll();
    }
    setEditLoading(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskLoading(true);
    const { error } = await supabase.from("project_tasks").insert({
      project_id: id,
      title: taskForm.title,
      description: taskForm.description || null,
      priority: taskForm.priority as any,
      status: taskForm.status as any,
      due_date: taskForm.due_date || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task added" });
      setTaskOpen(false);
      setTaskForm({ title: "", description: "", priority: "medium", status: "todo", due_date: "" });
      fetchAll();
    }
    setTaskLoading(false);
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetLoading(true);
    const { error } = await supabase.from("project_budgets").insert({
      project_id: id,
      category: budgetForm.category,
      description: budgetForm.description || null,
      estimated_amount: Number(budgetForm.estimated_amount),
      actual_amount: budgetForm.actual_amount ? Number(budgetForm.actual_amount) : 0,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Budget item added" });
      setBudgetOpen(false);
      setBudgetForm({ category: "", description: "", estimated_amount: "", actual_amount: "" });
      fetchAll();
    }
    setBudgetLoading(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from("project_tasks").delete().eq("id", taskId);
    if (!error) fetchAll();
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    const { error } = await supabase.from("project_tasks").update({ status }).eq("id", taskId);
    if (!error) fetchAll();
  };

  const getProfileName = (userId: string) => {
    const p = profiles.find((pr) => pr.user_id === userId);
    return p?.full_name || "Unknown";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">Project not found</p>
          <Link to="/dashboard/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const totalEstimated = budgets.reduce((s, b) => s + Number(b.estimated_amount || 0), 0);
  const totalActual = budgets.reduce((s, b) => s + Number(b.actual_amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Link to="/dashboard/projects">
              <Button variant="ghost" size="sm" className="mt-0.5">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-foreground">{project.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                {project.client_name && <span>{project.client_name}</span>}
                {project.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {project.location}
                  </span>
                )}
                <Badge className={`text-[10px] ${STATUS_COLORS[project.status] || ""}`}>
                  {project.status?.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Pencil size={14} className="mr-1.5" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditProject} className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Client</Label>
                    <Input value={editForm.client_name} onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Budget (UGX)</Label>
                    <Input type="number" value={editForm.budget} onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["planning", "in_progress", "on_hold", "completed", "cancelled"].map((s) => (
                          <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Progress %</Label>
                    <Input type="number" min={0} max={100} value={editForm.progress} onChange={(e) => setEditForm({ ...editForm, progress: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Start Date</Label>
                    <Input type="date" value={editForm.start_date} onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>End Date</Label>
                    <Input type="date" value={editForm.end_date} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" disabled={editLoading} className="w-full bg-primary text-primary-foreground font-semibold">
                  {editLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Progress</div>
            <div className="text-lg font-bold text-foreground mt-1">{project.progress || 0}%</div>
            <Progress value={project.progress || 0} className="h-1.5 mt-2" />
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Tasks</div>
            <div className="text-lg font-bold text-foreground mt-1">{tasks.length}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {tasks.filter((t) => t.status === "completed").length} completed
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Budget</div>
            <div className="text-lg font-bold text-foreground mt-1">
              UGX {Number(project.budget || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Spent: UGX {totalActual.toLocaleString()}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Timeline</div>
            <div className="text-sm font-medium text-foreground mt-1">
              {project.start_date
                ? new Date(project.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })
                : "Not set"}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {project.end_date
                ? `Ends ${new Date(project.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}`
                : "No end date"}
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks">
          <TabsList>
            <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="budget">Budget ({budgets.length})</TabsTrigger>
            <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
            <TabsTrigger value="team">Team ({teamMembers.length})</TabsTrigger>
          </TabsList>

          {/* Tasks tab */}
          <TabsContent value="tasks" className="space-y-3">
            <div className="flex justify-end">
              <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    <Plus size={14} className="mr-1" /> Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddTask} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Title *</Label>
                      <Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Input value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label>Priority</Label>
                        <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["low", "medium", "high", "critical"].map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select value={taskForm.status} onValueChange={(v) => setTaskForm({ ...taskForm, status: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["todo", "in_progress", "completed", "blocked"].map((s) => (
                              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Due Date</Label>
                        <Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                      </div>
                    </div>
                    <Button type="submit" disabled={taskLoading} className="w-full bg-primary text-primary-foreground font-semibold">
                      {taskLoading ? "Adding..." : "Add Task"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {tasks.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">No tasks yet</Card>
            ) : (
              <div className="space-y-2">
                {tasks.map((t) => (
                  <Card key={t.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-foreground">{t.title}</div>
                      {t.description && (
                        <div className="text-xs text-muted-foreground truncate">{t.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`text-[10px] ${PRIORITY_COLORS[t.priority] || ""}`}>
                        {t.priority}
                      </Badge>
                      <Select value={t.status} onValueChange={(v) => handleUpdateTaskStatus(t.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["todo", "in_progress", "completed", "blocked"].map((s) => (
                            <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {t.due_date && (
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(t.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      )}
                      <button onClick={() => handleDeleteTask(t.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Budget tab */}
          <TabsContent value="budget" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">
                  Estimated: <span className="font-semibold text-foreground">UGX {totalEstimated.toLocaleString()}</span>
                </span>
                <span className="text-muted-foreground">
                  Actual: <span className="font-semibold text-foreground">UGX {totalActual.toLocaleString()}</span>
                </span>
              </div>
              <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    <Plus size={14} className="mr-1" /> Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Budget Item</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddBudget} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Category *</Label>
                      <Input value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })} required placeholder="e.g. Materials, Labour" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Input value={budgetForm.description} onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Estimated (UGX)</Label>
                        <Input type="number" value={budgetForm.estimated_amount} onChange={(e) => setBudgetForm({ ...budgetForm, estimated_amount: e.target.value })} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Actual (UGX)</Label>
                        <Input type="number" value={budgetForm.actual_amount} onChange={(e) => setBudgetForm({ ...budgetForm, actual_amount: e.target.value })} />
                      </div>
                    </div>
                    <Button type="submit" disabled={budgetLoading} className="w-full bg-primary text-primary-foreground font-semibold">
                      {budgetLoading ? "Adding..." : "Add Budget Item"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {budgets.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">No budget items</Card>
            ) : (
              <div className="space-y-2">
                {budgets.map((b) => {
                  const variance = Number(b.estimated_amount) - Number(b.actual_amount || 0);
                  return (
                    <Card key={b.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-foreground">{b.category}</div>
                        {b.description && <div className="text-xs text-muted-foreground">{b.description}</div>}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">UGX {Number(b.estimated_amount).toLocaleString()}</div>
                        <div className={`text-xs ${variance < 0 ? "text-destructive" : "text-green-600"}`}>
                          {variance < 0 ? "Over" : "Under"} by UGX {Math.abs(variance).toLocaleString()}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Expenses tab */}
          <TabsContent value="expenses" className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">UGX {totalExpenses.toLocaleString()}</span>
            </div>
            {expenses.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">No expenses recorded</Card>
            ) : (
              <div className="space-y-2">
                {expenses.map((e) => (
                  <Card key={e.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-foreground">{e.category}</div>
                      <div className="text-xs text-muted-foreground">
                        {e.vendor && `${e.vendor} · `}
                        {new Date(e.expense_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          e.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : e.status === "rejected"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {e.status}
                      </Badge>
                      <span className="font-medium text-sm text-foreground">
                        UGX {Number(e.amount).toLocaleString()}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Team tab */}
          <TabsContent value="team" className="space-y-3">
            {teamMembers.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">No team members assigned</Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {teamMembers.map((m) => (
                  <Card key={m.id} className="p-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {getProfileName(m.user_id).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-foreground">{getProfileName(m.user_id)}</div>
                      <div className="text-xs text-muted-foreground capitalize">{m.role}</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
