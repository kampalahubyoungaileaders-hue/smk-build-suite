import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const Budgets = () => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    project_id: "",
    category: "",
    description: "",
    estimated_amount: "",
    actual_amount: "",
  });

  const fetchData = async () => {
    const [budgetsRes, projectsRes] = await Promise.all([
      supabase.from("project_budgets").select("*, projects(name)").order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name"),
    ]);
    setBudgets(budgetsRes.data || []);
    setProjects(projectsRes.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("project_budgets").insert({
      project_id: form.project_id,
      category: form.category,
      description: form.description || null,
      estimated_amount: Number(form.estimated_amount),
      actual_amount: form.actual_amount ? Number(form.actual_amount) : 0,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Budget item created" });
      setOpen(false);
      setForm({ project_id: "", category: "", description: "", estimated_amount: "", actual_amount: "" });
      fetchData();
    }
    setLoading(false);
  };

  const totalEstimated = budgets.reduce((s, b) => s + Number(b.estimated_amount || 0), 0);
  const totalActual = budgets.reduce((s, b) => s + Number(b.actual_amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Budgets</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-smk-red-dark font-semibold">
                <Plus size={16} className="mr-1" /> Add Budget Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Budget Item</DialogTitle>
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
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required placeholder="e.g. Materials, Labour, Equipment" />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Estimated (UGX)</Label>
                    <Input type="number" value={form.estimated_amount} onChange={(e) => setForm({ ...form, estimated_amount: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Actual (UGX)</Label>
                    <Input type="number" value={form.actual_amount} onChange={(e) => setForm({ ...form, actual_amount: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" disabled={loading || !form.project_id} className="w-full bg-accent text-accent-foreground hover:bg-smk-red-dark font-semibold">
                  {loading ? "Adding..." : "Add Budget Item"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Total Estimated</div>
            <div className="text-xl font-bold text-foreground">UGX {totalEstimated.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Total Actual</div>
            <div className="text-xl font-bold text-foreground">UGX {totalActual.toLocaleString()}</div>
          </Card>
        </div>

        {budgets.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No budget items yet.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {budgets.map((b) => (
              <Card key={b.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-foreground">{b.category}</div>
                  <div className="text-xs text-muted-foreground">
                    {(b.projects as any)?.name} {b.description ? `· ${b.description}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">UGX {Number(b.estimated_amount).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Actual: UGX {Number(b.actual_amount).toLocaleString()}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Budgets;
