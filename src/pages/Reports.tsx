import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Printer } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { EmptyState, LoadingRows, PageHeader, SectionCard, StatCard, StatusBadge } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projectStatus } from "@/lib/status";
import { daysUntil, downloadFile, formatDate, formatUGX, formatUGXCompact, isOverdue, toCSV, todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { Row } from "@/lib/db";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Row[]>([]);
  const [tasks, setTasks] = useState<Row[]>([]);
  const [expenses, setExpenses] = useState<Row[]>([]);
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [payments, setPayments] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const [p, t, e, i, pm] = await Promise.all([
        supabase.from("projects").select("*").order("name"),
        supabase.from("project_tasks").select("project_id, status, due_date"),
        supabase.from("expenses").select("project_id, amount, status"),
        supabase.from("invoices").select("project_id, total_amount, status"),
        supabase.from("payments").select("project_id, amount, payment_type"),
      ]);
      setProjects(p.data ?? []);
      setTasks(t.data ?? []);
      setExpenses(e.data ?? []);
      setInvoices(i.data ?? []);
      setPayments(pm.data ?? []);
      setLoading(false);
    })();
  }, []);

  const rows = useMemo(
    () =>
      projects.map((p): Row => {
        const pt = tasks.filter((t) => t.project_id === p.id);
        const sum = (list: Row[], key: string) => list.reduce((s, x) => s + Number(x[key] || 0), 0);
        const budget = Number(p.budget || 0);
        const spent = sum(expenses.filter((e) => e.project_id === p.id && e.status === "approved"), "amount");
        const invoiced = sum(invoices.filter((i) => i.project_id === p.id && i.status !== "cancelled" && i.status !== "draft"), "total_amount");
        const received = sum(payments.filter((x) => x.project_id === p.id && x.payment_type === "incoming"), "amount");
        const open = p.status !== "completed" && p.status !== "cancelled";
        return {
          ...p,
          taskTotal: pt.length,
          taskDone: pt.filter((t) => t.status === "completed").length,
          taskOverdue: pt.filter((t) => t.status !== "completed" && isOverdue(t.due_date)).length,
          daysLeft: open && p.end_date ? daysUntil(p.end_date) : null,
          budget,
          spent,
          remaining: budget - spent,
          usedPct: budget ? Math.round((spent / budget) * 100) : null,
          invoiced,
          received,
        };
      }),
    [projects, tasks, expenses, invoices, payments],
  );

  const totals = rows.reduce(
    (a, r) => ({ budget: a.budget + r.budget, spent: a.spent + r.spent, invoiced: a.invoiced + r.invoiced, received: a.received + r.received }),
    { budget: 0, spent: 0, invoiced: 0, received: 0 },
  );
  const completed = rows.filter((r) => r.status === "completed").length;
  const late = rows.filter((r) => r.daysLeft !== null && r.daysLeft < 0).length;
  const overBudget = rows.filter((r) => r.budget && r.spent > r.budget).length;

  const stamp = todayISO();

  const exportProjects = () =>
    downloadFile(
      toCSV(
        ["Project", "Client", "Location", "Status", "Progress %", "Tasks done", "Tasks total", "Overdue tasks", "Start", "Target completion"],
        rows.map((r) => [r.name, r.client_name, r.location, projectStatus.label(r.status), r.progress || 0, r.taskDone, r.taskTotal, r.taskOverdue, r.start_date, r.end_date]),
      ),
      `smk-project-report-${stamp}.csv`,
    );

  const exportFinance = () =>
    downloadFile(
      toCSV(
        ["Project", "Budget (UGX)", "Approved spend (UGX)", "Remaining (UGX)", "Budget used %", "Invoiced (UGX)", "Received (UGX)"],
        rows.map((r) => [r.name, r.budget, r.spent, r.remaining, r.usedPct ?? "", r.invoiced, r.received]),
      ),
      `smk-finance-report-${stamp}.csv`,
    );

  const chart = rows
    .filter((r) => r.budget || r.spent)
    .map((r) => ({ name: r.name.length > 18 ? `${r.name.slice(0, 17)}…` : r.name, Budget: r.budget, Spent: r.spent, Received: r.received }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Reports"
          description={`Prepared ${formatDate(stamp)}. Spend counts approved expenses only.`}
          actions={
            <Button variant="outline" onClick={() => window.print()} className="print:hidden">
              <Printer /> Print or save as PDF
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard loading={loading} label="Projects" value={rows.length} hint={`${completed} completed`} />
          <StatCard loading={loading} label="Running late" value={late} hint="Past target completion" emphasis={late ? "danger" : undefined} />
          <StatCard loading={loading} label="Over budget" value={overBudget} hint={`${formatUGXCompact(totals.spent)} spent of ${formatUGXCompact(totals.budget)}`} emphasis={overBudget ? "danger" : undefined} />
          <StatCard loading={loading} label="Collected" value={formatUGXCompact(totals.received)} hint={`of ${formatUGXCompact(totals.invoiced)} invoiced`} />
        </div>

        {loading ? (
          <LoadingRows rows={5} />
        ) : rows.length === 0 ? (
          <Card><EmptyState title="Nothing to report yet" description="Reports fill in as you add projects, tasks and expenses." /></Card>
        ) : (
          <Tabs defaultValue="projects">
            <TabsList className="print:hidden">
              <TabsTrigger value="projects">Project progress</TabsTrigger>
              <TabsTrigger value="financial">Financial summary</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-4 space-y-4">
              <div className="flex justify-end print:hidden">
                <Button variant="outline" onClick={exportProjects}><Download /> Download CSV</Button>
              </div>
              <Card className="overflow-x-auto">
                <table className="tabular w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Project</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="w-48 px-4 py-3 font-medium">Progress</th>
                      <th className="px-4 py-3 text-right font-medium">Tasks done</th>
                      <th className="px-4 py-3 text-right font-medium">Overdue</th>
                      <th className="px-4 py-3 text-right font-medium">Schedule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3">
                          <Link to={`/dashboard/projects/${r.id}`} className="font-medium text-foreground hover:text-primary hover:underline">{r.name}</Link>
                          <div className="text-muted-foreground">{[r.client_name, r.location].filter(Boolean).join(" · ")}</div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge tone={projectStatus.tone(r.status)}>{projectStatus.label(r.status)}</StatusBadge></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={r.progress || 0} className="h-2 flex-1" />
                            <span className="w-10 text-right font-medium text-foreground">{r.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">{r.taskDone} / {r.taskTotal}</td>
                        <td className={cn("px-4 py-3 text-right", r.taskOverdue ? "font-medium text-destructive" : "text-muted-foreground")}>{r.taskOverdue || "—"}</td>
                        <td className={cn("px-4 py-3 text-right", r.daysLeft !== null && r.daysLeft < 0 ? "font-medium text-destructive" : "text-muted-foreground")}>
                          {r.daysLeft === null ? (r.status === "completed" ? "Finished" : "—") : r.daysLeft < 0 ? `${-r.daysLeft} days late` : `${r.daysLeft} days left`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="mt-4 space-y-4">
              <div className="flex justify-end print:hidden">
                <Button variant="outline" onClick={exportFinance}><Download /> Download CSV</Button>
              </div>
              {chart.length > 0 && (
                <SectionCard title="Budget, spend and money received">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chart} barGap={3} margin={{ left: -8, right: 4 }}>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={0} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatUGXCompact(v, false)} />
                      <Tooltip cursor={{ fill: "hsl(var(--muted))" }} formatter={(v: number) => formatUGX(v)} contentStyle={{ borderRadius: 6, border: "1px solid hsl(var(--border))", fontSize: 13 }} />
                      <Legend iconType="square" wrapperStyle={{ fontSize: 13 }} />
                      <Bar dataKey="Budget" fill="hsl(var(--navy))" radius={[3, 3, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="Spent" fill="hsl(var(--smk-red))" radius={[3, 3, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="Received" fill="hsl(var(--success))" radius={[3, 3, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </SectionCard>
              )}
              <Card className="overflow-x-auto">
                <table className="tabular w-full min-w-[820px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Project</th>
                      <th className="px-4 py-3 text-right font-medium">Budget</th>
                      <th className="px-4 py-3 text-right font-medium">Approved spend</th>
                      <th className="px-4 py-3 text-right font-medium">Remaining</th>
                      <th className="px-4 py-3 text-right font-medium">Used</th>
                      <th className="px-4 py-3 text-right font-medium">Invoiced</th>
                      <th className="px-4 py-3 text-right font-medium">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                        <td className="px-4 py-3 text-right text-foreground">{r.budget ? formatUGX(r.budget) : "—"}</td>
                        <td className="px-4 py-3 text-right text-foreground">{formatUGX(r.spent)}</td>
                        <td className={cn("px-4 py-3 text-right font-medium", !r.budget ? "text-muted-foreground" : r.remaining < 0 ? "text-destructive" : "text-foreground")}>
                          {!r.budget ? "—" : r.remaining < 0 ? `${formatUGX(-r.remaining)} over` : formatUGX(r.remaining)}
                        </td>
                        <td className={cn("px-4 py-3 text-right", r.usedPct !== null && r.usedPct > 100 ? "font-medium text-destructive" : "text-muted-foreground")}>{r.usedPct === null ? "—" : `${r.usedPct}%`}</td>
                        <td className="px-4 py-3 text-right text-foreground">{formatUGX(r.invoiced)}</td>
                        <td className="px-4 py-3 text-right text-foreground">{formatUGX(r.received)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-semibold text-foreground">
                      <td className="px-4 py-3">Total</td>
                      <td className="px-4 py-3 text-right">{formatUGX(totals.budget)}</td>
                      <td className="px-4 py-3 text-right">{formatUGX(totals.spent)}</td>
                      <td className="px-4 py-3 text-right">{formatUGX(totals.budget - totals.spent)}</td>
                      <td className="px-4 py-3 text-right">{totals.budget ? `${Math.round((totals.spent / totals.budget) * 100)}%` : "—"}</td>
                      <td className="px-4 py-3 text-right">{formatUGX(totals.invoiced)}</td>
                      <td className="px-4 py-3 text-right">{formatUGX(totals.received)}</td>
                    </tr>
                  </tfoot>
                </table>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
