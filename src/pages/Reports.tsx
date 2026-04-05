import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FolderKanban, Wallet, ListTodo } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ["hsl(213,52%,24%)", "hsl(217,91%,60%)", "hsl(142,71%,45%)", "hsl(40,96%,50%)", "hsl(0,84%,60%)"];

const Reports = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [pRes, tRes, bRes, eRes, iRes, pmRes] = await Promise.all([
        supabase.from("projects").select("*"),
        supabase.from("project_tasks").select("*, projects(name)"),
        supabase.from("project_budgets").select("*, projects(name)"),
        supabase.from("expenses").select("*, projects(name)"),
        supabase.from("invoices").select("*, projects(name)"),
        supabase.from("payments").select("*, projects(name)"),
      ]);
      setProjects(pRes.data || []);
      setTasks(tRes.data || []);
      setBudgets(bRes.data || []);
      setExpenses(eRes.data || []);
      setInvoices(iRes.data || []);
      setPayments(pmRes.data || []);
    };
    load();
  }, []);

  // Project status distribution
  const statusCounts: Record<string, number> = {};
  projects.forEach((p) => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace("_", " "), value }));

  // Financial by project
  const projectFinancials = projects.map((p) => {
    const pBudgets = budgets.filter((b) => b.project_id === p.id);
    const pExpenses = expenses.filter((e) => e.project_id === p.id);
    const estimated = pBudgets.reduce((s: number, b: any) => s + Number(b.estimated_amount || 0), 0);
    const actual = pBudgets.reduce((s: number, b: any) => s + Number(b.actual_amount || 0), 0);
    const expenseTotal = pExpenses.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
    return { name: p.name, budget: Number(p.budget || 0), estimated, actual, expenses: expenseTotal, progress: p.progress || 0 };
  });

  // Task stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed").length;

  // Export CSV
  const exportProjectsCSV = () => {
    const header = "Project,Status,Progress,Budget,Location,Client,Start Date,End Date\n";
    const rows = projects.map((p) =>
      `"${p.name}","${p.status}",${p.progress || 0},${p.budget || 0},"${p.location || ""}","${p.client_name || ""}","${p.start_date || ""}","${p.end_date || ""}"`
    ).join("\n");
    downloadCSV(header + rows, "projects-report.csv");
  };

  const exportFinanceCSV = () => {
    const header = "Project,Budget,Estimated,Actual,Expenses\n";
    const rows = projectFinancials.map((p) =>
      `"${p.name}",${p.budget},${p.estimated},${p.actual},${p.expenses}`
    ).join("\n");
    downloadCSV(header + rows, "finance-report.csv");
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Reports</h2>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FolderKanban size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground uppercase">Projects</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{projects.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {projects.filter((p) => p.status === "completed").length} completed
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ListTodo size={16} className="text-blue-600" />
              <span className="text-xs text-muted-foreground uppercase">Tasks</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{totalTasks}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {completedTasks} done, {overdueTasks} overdue
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-green-600" />
              <span className="text-xs text-muted-foreground uppercase">Total Budget</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              UGX {projects.reduce((s: number, p: any) => s + Number(p.budget || 0), 0).toLocaleString()}
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-accent" />
              <span className="text-xs text-muted-foreground uppercase">Total Expenses</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              UGX {expenses.reduce((s: number, e: any) => s + Number(e.amount || 0), 0).toLocaleString()}
            </div>
          </Card>
        </div>

        <Tabs defaultValue="projects">
          <TabsList>
            <TabsTrigger value="projects">Project Reports</TabsTrigger>
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={exportProjectsCSV}>
                <Download size={14} className="mr-1.5" /> Export CSV
              </Button>
            </div>

            {/* Status chart */}
            {statusData.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-sm text-foreground mb-3">Project Status Distribution</h3>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {statusData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {statusData.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-muted-foreground capitalize">{item.name}</span>
                        </div>
                        <span className="font-medium text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Project progress table */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-foreground mb-3">Project Progress</h3>
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.client_name || p.location || ""}</div>
                    </div>
                    <div className="w-32">
                      <Progress value={p.progress || 0} className="h-2" />
                    </div>
                    <span className="text-sm font-medium text-foreground w-10 text-right">{p.progress || 0}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={exportFinanceCSV}>
                <Download size={14} className="mr-1.5" /> Export CSV
              </Button>
            </div>

            {/* Financial chart */}
            {projectFinancials.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-sm text-foreground mb-3">Budget vs Expenses by Project</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={projectFinancials} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                    <Tooltip formatter={(value: number) => `UGX ${value.toLocaleString()}`} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", fontSize: "12px" }} />
                    <Bar dataKey="budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Budget" />
                    <Bar dataKey="expenses" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Financial details table */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-foreground mb-3">Financial Summary per Project</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs text-muted-foreground font-medium">Project</th>
                      <th className="text-right py-2 text-xs text-muted-foreground font-medium">Budget</th>
                      <th className="text-right py-2 text-xs text-muted-foreground font-medium">Estimated</th>
                      <th className="text-right py-2 text-xs text-muted-foreground font-medium">Actual</th>
                      <th className="text-right py-2 text-xs text-muted-foreground font-medium">Expenses</th>
                      <th className="text-right py-2 text-xs text-muted-foreground font-medium">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectFinancials.map((p) => {
                      const variance = p.budget - p.expenses;
                      return (
                        <tr key={p.name} className="border-b border-border last:border-0">
                          <td className="py-2 font-medium text-foreground">{p.name}</td>
                          <td className="py-2 text-right text-muted-foreground">UGX {p.budget.toLocaleString()}</td>
                          <td className="py-2 text-right text-muted-foreground">UGX {p.estimated.toLocaleString()}</td>
                          <td className="py-2 text-right text-muted-foreground">UGX {p.actual.toLocaleString()}</td>
                          <td className="py-2 text-right text-muted-foreground">UGX {p.expenses.toLocaleString()}</td>
                          <td className={`py-2 text-right font-medium ${variance < 0 ? "text-destructive" : "text-green-600"}`}>
                            {variance < 0 ? "-" : "+"}UGX {Math.abs(variance).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
