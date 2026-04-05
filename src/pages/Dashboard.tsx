import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  ListTodo,
  Wallet,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";
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

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700",
  on_hold: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-destructive/10 text-destructive",
};

const TASK_PIE_COLORS = ["hsl(213,52%,24%)", "hsl(217,91%,60%)", "hsl(142,71%,45%)", "hsl(0,84%,60%)"];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, tasks: 0, budget: 0, team: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<any[]>([]);
  const [projectBudgets, setProjectBudgets] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const [projectsRes, tasksRes, budgetsRes, teamRes, expensesRes] = await Promise.all([
        supabase.from("projects").select("*"),
        supabase.from("project_tasks").select("*, projects(name)"),
        supabase.from("project_budgets").select("*, projects(name)"),
        supabase.from("team_members").select("*", { count: "exact", head: true }),
        supabase.from("expenses").select("amount, status"),
      ]);

      const projects = projectsRes.data || [];
      const tasks = tasksRes.data || [];
      const budgets = budgetsRes.data || [];
      const expenses = expensesRes.data || [];

      const totalBudget = projects.reduce((s: number, p: any) => s + Number(p.budget || 0), 0);
      const totalExpenses = expenses
        .filter((e: any) => e.status === "approved")
        .reduce((s: number, e: any) => s + Number(e.amount || 0), 0);

      setStats({
        projects: projects.length,
        tasks: tasks.length,
        budget: totalBudget,
        team: teamRes.count || 0,
      });

      // Recent projects
      const sorted = [...projects].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentProjects(sorted.slice(0, 5));

      // Upcoming tasks
      const pending = tasks
        .filter((t: any) => t.status !== "completed" && t.due_date)
        .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      setUpcomingTasks(pending.slice(0, 6));

      // Task status distribution
      const statusCounts: Record<string, number> = {};
      tasks.forEach((t: any) => {
        statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      });
      setTasksByStatus(
        Object.entries(statusCounts).map(([name, value]) => ({
          name: name.replace("_", " "),
          value,
        }))
      );

      // Budget vs Actual per project
      const budgetByProject: Record<string, { name: string; estimated: number; actual: number }> = {};
      budgets.forEach((b: any) => {
        const pName = (b.projects as any)?.name || "Unknown";
        if (!budgetByProject[b.project_id]) {
          budgetByProject[b.project_id] = { name: pName, estimated: 0, actual: 0 };
        }
        budgetByProject[b.project_id].estimated += Number(b.estimated_amount || 0);
        budgetByProject[b.project_id].actual += Number(b.actual_amount || 0);
      });
      setProjectBudgets(Object.values(budgetByProject).slice(0, 6));

      // User role
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .limit(1);
        if (roles && roles.length > 0) setUserRole(roles[0].role);
      }
    };
    load();
  }, [user]);

  const statCards = [
    {
      label: "Active Projects",
      value: stats.projects,
      icon: FolderKanban,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/dashboard/projects",
    },
    {
      label: "Open Tasks",
      value: stats.tasks,
      icon: ListTodo,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/dashboard/tasks",
    },
    {
      label: "Total Budget",
      value: `UGX ${(stats.budget / 1e6).toFixed(1)}M`,
      icon: Wallet,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/dashboard/finance",
    },
    {
      label: "Team Members",
      value: stats.team,
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10",
      href: "/dashboard/team",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Welcome back{userRole ? `, ${userRole.replace("_", " ")}` : ""}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here is an overview of your construction projects
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Link to={s.href} key={s.label}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {s.label}
                  </span>
                  <div className={`p-2 rounded-lg ${s.bg}`}>
                    <s.icon size={16} className={s.color} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Budget vs Actual */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-foreground">Budget vs Actual by Project</h3>
              <TrendingUp size={16} className="text-muted-foreground" />
            </div>
            {projectBudgets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No budget data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={projectBudgets} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: number) => `UGX ${value.toLocaleString()}`}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="estimated" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Estimated" />
                  <Bar dataKey="actual" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Task Distribution */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-foreground">Task Distribution</h3>
            </div>
            {tasksByStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No tasks yet</p>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={tasksByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {tasksByStatus.map((_, i) => (
                        <Cell key={i} fill={TASK_PIE_COLORS[i % TASK_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {tasksByStatus.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: TASK_PIE_COLORS[i % TASK_PIE_COLORS.length] }}
                        />
                        <span className="text-muted-foreground capitalize">{item.name}</span>
                      </div>
                      <span className="font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Projects + Upcoming Tasks */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Recent Projects */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-foreground">Recent Projects</h3>
              <Link
                to="/dashboard/projects"
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No projects yet</p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/dashboard/projects/${p.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-foreground truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {p.client_name || p.location || "No details"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${STATUS_COLORS[p.status] || ""}`}
                        >
                          {p.status?.replace("_", " ")}
                        </Badge>
                        <div className="w-16">
                          <Progress value={p.progress || 0} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Tasks */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-foreground">Upcoming Deadlines</h3>
              <Link
                to="/dashboard/tasks"
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming tasks</p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((t) => {
                  const isOverdue = t.due_date && new Date(t.due_date) < new Date();
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-foreground truncate">
                          {t.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(t.projects as any)?.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        {isOverdue && <AlertTriangle size={14} className="text-destructive" />}
                        <span
                          className={`text-xs font-medium ${
                            isOverdue ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          <Clock size={12} className="inline mr-1" />
                          {new Date(t.due_date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
