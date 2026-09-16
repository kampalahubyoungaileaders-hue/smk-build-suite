import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, ListTodo, Wallet, FileText, CalendarClock, ChevronRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { EmptyState, LoadingRows, PageHeader, SectionCard, StatCard, StatusBadge } from "@/components/dashboard/ui";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ACTIVE_PROJECT_STATUSES, projectStatus, taskStatus, toneClasses } from "@/lib/status";
import { daysUntil, formatDate, formatUGX, formatUGXCompact, isOverdue } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { Row } from "@/lib/db";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const dueLabel = (due: string) => {
  const d = daysUntil(due);
  if (d < 0) return { text: `${-d} day${d === -1 ? "" : "s"} overdue`, danger: true };
  if (d === 0) return { text: "Due today", danger: false };
  if (d === 1) return { text: "Due tomorrow", danger: false };
  if (d <= 14) return { text: `In ${d} days`, danger: false };
  return { text: formatDate(due, { year: false }), danger: false };
};

const TASK_BAR_COLORS: Record<string, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-blue-600",
  blocked: "bg-red-600",
  completed: "bg-emerald-600",
};

const Dashboard = () => {
  const { profile, user, can } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Row[]>([]);
  const [tasks, setTasks] = useState<Row[]>([]);
  const [expenses, setExpenses] = useState<Row[]>([]);
  const [invoices, setInvoices] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const [p, t, e, i] = await Promise.all([
        supabase.from("projects").select("*").order("updated_at", { ascending: false }),
        supabase.from("project_tasks").select("*, projects(name)"),
        supabase.from("expenses").select("project_id, amount, status"),
        supabase.from("invoices").select("total_amount, status, due_date"),
      ]);
      setProjects(p.data ?? []);
      setTasks(t.data ?? []);
      setExpenses(e.data ?? []);
      setInvoices(i.data ?? []);
      setLoading(false);
    })();
  }, []);

  const activeProjects = projects.filter((p) => ACTIVE_PROJECT_STATUSES.includes(p.status));
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const openTasks = tasks.filter((t) => t.status !== "completed");
  const overdueTasks = openTasks.filter((t) => isOverdue(t.due_date));
  const approved = expenses.filter((e) => e.status === "approved");
  const pendingExpenses = expenses.filter((e) => e.status === "pending");
  const totalBudget = activeProjects.reduce((s, p) => s + Number(p.budget || 0), 0);
  const spentOnActive = approved
    .filter((e) => activeProjects.some((p) => p.id === e.project_id))
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const outstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const overdueInvoices = invoices.filter(
    (i) => i.status === "overdue" || (i.status === "sent" && isOverdue(i.due_date)),
  ).length;

  const budgetChart = activeProjects
    .map((p) => ({
      name: p.name.length > 18 ? `${p.name.slice(0, 17)}…` : p.name,
      Budget: Number(p.budget || 0),
      Spent: approved.filter((e) => e.project_id === p.id).reduce((s, e) => s + Number(e.amount || 0), 0),
    }))
    .filter((r) => r.Budget > 0 || r.Spent > 0)
    .slice(0, 8);

  const taskCounts = taskStatus.list.map((s) => ({
    ...s,
    count: tasks.filter((t) => t.status === s.value).length,
  }));

  const upcoming = openTasks
    .filter((t) => t.due_date)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 6);

  const firstName = (profile?.full_name || user?.email || "").split(/[\s@]/)[0];
  const budgetPct = totalBudget ? Math.round((spentOnActive / totalBudget) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
          description={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          actions={
            can.manageProjects && (
              <Button asChild>
                <Link to="/dashboard/projects?new=1">New project</Link>
              </Button>
            )
          }
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard
            loading={loading}
            label="Active projects"
            icon={FolderKanban}
            value={activeProjects.length}
            hint={`${completedProjects} completed`}
            href="/dashboard/projects"
          />
          <StatCard
            loading={loading}
            label="Open tasks"
            icon={ListTodo}
            value={openTasks.length}
            hint={overdueTasks.length ? `${overdueTasks.length} overdue` : "Nothing overdue"}
            emphasis={overdueTasks.length ? "danger" : undefined}
            href="/dashboard/tasks"
          />
          <StatCard
            loading={loading}
            label="Budget used"
            icon={Wallet}
            value={`${budgetPct}%`}
            hint={`${formatUGXCompact(spentOnActive)} of ${formatUGXCompact(totalBudget)}`}
            emphasis={budgetPct > 100 ? "danger" : undefined}
            href="/dashboard/finance"
          />
          <StatCard
            loading={loading}
            label="Unpaid invoices"
            icon={FileText}
            value={formatUGXCompact(outstanding)}
            hint={
              overdueInvoices
                ? `${overdueInvoices} past due`
                : pendingExpenses.length
                  ? `${pendingExpenses.length} expense${pendingExpenses.length === 1 ? "" : "s"} to approve`
                  : "All up to date"
            }
            emphasis={overdueInvoices ? "danger" : undefined}
            href="/dashboard/finance"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-5">
          <SectionCard title="Budget and approved spend" className="xl:col-span-3">
            {loading ? (
              <LoadingRows rows={3} />
            ) : budgetChart.length === 0 ? (
              <EmptyState
                compact
                icon={Wallet}
                title="No budgets to compare yet"
                description="Set a budget on a project and approve its expenses to see spend against budget here."
              />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={budgetChart} barGap={3} margin={{ left: -8, right: 4 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatUGXCompact(v, false)} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    formatter={(v: number) => formatUGX(v)}
                    contentStyle={{ borderRadius: 6, border: "1px solid hsl(var(--border))", fontSize: 13 }}
                  />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 13 }} />
                  <Bar dataKey="Budget" fill="hsl(var(--navy))" radius={[3, 3, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="Spent" fill="hsl(var(--smk-red))" radius={[3, 3, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Tasks by status" className="xl:col-span-2">
            {loading ? (
              <LoadingRows rows={3} />
            ) : tasks.length === 0 ? (
              <EmptyState compact icon={ListTodo} title="No tasks yet" description="Tasks you add to projects will be counted here." />
            ) : (
              <div className="space-y-5">
                <div className="flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
                  {taskCounts.map((s) =>
                    s.count ? (
                      <div key={s.value} className={TASK_BAR_COLORS[s.value]} style={{ width: `${(s.count / tasks.length) * 100}%` }} />
                    ) : null,
                  )}
                </div>
                <ul className="divide-y">
                  {taskCounts.map((s) => (
                    <li key={s.value} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="flex items-center gap-2.5 text-foreground">
                        <span className={cn("h-2.5 w-2.5 rounded-sm", TASK_BAR_COLORS[s.value])} />
                        {s.label}
                      </span>
                      <span className="tabular font-semibold text-foreground">{s.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Active projects"
            action={
              <Link to="/dashboard/projects" className="flex items-center text-sm font-medium text-primary hover:underline">
                All projects <ChevronRight size={16} />
              </Link>
            }
          >
            {loading ? (
              <LoadingRows />
            ) : activeProjects.length === 0 ? (
              <EmptyState compact icon={FolderKanban} title="No active projects" />
            ) : (
              <ul className="-mx-2">
                {activeProjects.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/dashboard/projects/${p.id}`}
                      className="flex items-center gap-4 rounded-md px-2 py-3 transition-colors hover:bg-muted"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-foreground">{p.name}</div>
                        <div className="truncate text-sm text-muted-foreground">
                          {[p.client_name, p.location].filter(Boolean).join(", ") || "No client or location set"}
                        </div>
                      </div>
                      <StatusBadge tone={projectStatus.tone(p.status)} className="hidden sm:inline-flex">
                        {projectStatus.label(p.status)}
                      </StatusBadge>
                      <div className="w-20 shrink-0">
                        <div className="tabular mb-1 text-right text-xs font-medium text-foreground">{p.progress || 0}%</div>
                        <Progress value={p.progress || 0} className="h-1.5" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Upcoming deadlines"
            action={
              <Link to="/dashboard/tasks" className="flex items-center text-sm font-medium text-primary hover:underline">
                All tasks <ChevronRight size={16} />
              </Link>
            }
          >
            {loading ? (
              <LoadingRows />
            ) : upcoming.length === 0 ? (
              <EmptyState compact icon={CalendarClock} title="No upcoming deadlines" description="Open tasks with a due date will show here." />
            ) : (
              <ul className="divide-y">
                {upcoming.map((t) => {
                  const due = dueLabel(t.due_date);
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">{t.title}</div>
                        <div className="truncate text-sm text-muted-foreground">{t.projects?.name}</div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
                          due.danger ? toneClasses.danger : toneClasses.neutral,
                        )}
                      >
                        {due.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
