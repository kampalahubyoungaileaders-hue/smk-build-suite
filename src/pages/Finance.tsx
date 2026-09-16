import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Check, X, ArrowDownLeft, ArrowUpRight, Receipt, FileText, CreditCard, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BudgetLineDialog, ExpenseDialog, InvoiceDialog, PaymentDialog } from "@/components/dashboard/forms";
import { ConfirmDelete, EmptyState, LoadingRows, PageHeader, SectionCard, StatCard, StatusBadge, describeError } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { expenseStatus, invoiceStatus } from "@/lib/status";
import { formatDate, formatUGX, formatUGXCompact, isOverdue } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { Option, Row } from "@/lib/db";

const Finance = () => {
  const { user, can } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Row[]>([]);
  const [budgets, setBudgets] = useState<Row[]>([]);
  const [expenses, setExpenses] = useState<Row[]>([]);
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [payments, setPayments] = useState<Row[]>([]);
  const [people, setPeople] = useState<Row[]>([]);
  const [expenseFilter, setExpenseFilter] = useState("pending");
  const [open, setOpen] = useState<null | "budget" | "expense" | "invoice" | "payment">(null);

  const fetchAll = useCallback(async () => {
    const [p, b, e, i, pm, pr] = await Promise.all([
      supabase.from("projects").select("id, name, budget, client_name, status").order("name"),
      supabase.from("project_budgets").select("*, projects(name)").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*, projects(name)").order("expense_date", { ascending: false }),
      supabase.from("invoices").select("*, projects(name)").order("created_at", { ascending: false }),
      supabase.from("payments").select("*, projects(name), invoices(invoice_number)").order("payment_date", { ascending: false }),
      supabase.from("profiles").select("user_id, full_name"),
    ]);
    setProjects(p.data ?? []);
    setBudgets(b.data ?? []);
    setExpenses(e.data ?? []);
    setInvoices(i.data ?? []);
    setPayments(pm.data ?? []);
    setPeople(pr.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!loading && expenseFilter === "pending" && !expenses.some((e) => e.status === "pending")) setExpenseFilter("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const mutate = async (op: PromiseLike<{ error: { message: string } | null }>, fail: string, ok?: string) => {
    const { error } = await op;
    if (error) toast({ title: fail, description: describeError(error.message), variant: "destructive" });
    else {
      if (ok) toast({ title: ok });
      fetchAll();
    }
  };

  const nameOf = (uid?: string | null) => people.find((p) => p.user_id === uid)?.full_name || "Unknown";

  // Totals — only approved expenses count as spend.
  const totalBudget = projects.reduce((s, p) => s + Number(p.budget || 0), 0);
  const approvedSpend = expenses.filter((e) => e.status === "approved").reduce((s, e) => s + Number(e.amount || 0), 0);
  const pending = expenses.filter((e) => e.status === "pending");
  const pendingAmount = pending.reduce((s, e) => s + Number(e.amount || 0), 0);
  const paidOn = (invoiceId: string) => payments.filter((p) => p.invoice_id === invoiceId && p.payment_type === "incoming").reduce((s, p) => s + Number(p.amount || 0), 0);
  const effectiveStatus = (inv: Row) => (inv.status === "sent" && isOverdue(inv.due_date) ? "overdue" : inv.status);
  const receivable = invoices
    .filter((i) => ["sent", "overdue"].includes(i.status))
    .reduce((s, i) => s + Math.max(0, Number(i.total_amount || 0) - paidOn(i.id)), 0);
  const overdueCount = invoices.filter((i) => effectiveStatus(i) === "overdue").length;
  const moneyIn = payments.filter((p) => p.payment_type === "incoming").reduce((s, p) => s + Number(p.amount || 0), 0);
  const moneyOut = payments.filter((p) => p.payment_type === "outgoing").reduce((s, p) => s + Number(p.amount || 0), 0);

  const chartData = useMemo(
    () =>
      projects
        .map((p) => ({
          name: p.name.length > 18 ? `${p.name.slice(0, 17)}…` : p.name,
          Budget: Number(p.budget || 0),
          Spent: expenses.filter((e) => e.project_id === p.id && e.status === "approved").reduce((s, e) => s + Number(e.amount || 0), 0),
        }))
        .filter((r) => r.Budget || r.Spent)
        .slice(0, 10),
    [projects, expenses],
  );

  const suggestedInvoiceNumber = useMemo(() => {
    const year = new Date().getFullYear();
    const nums = invoices
      .map((i) => String(i.invoice_number).match(new RegExp(`^INV-${year}-(\\d+)$`))?.[1])
      .filter(Boolean)
      .map(Number);
    return `INV-${year}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`;
  }, [invoices]);

  const shownExpenses = expenseFilter === "all" ? expenses : expenses.filter((e) => e.status === expenseFilter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Finance" description="Budgets, site expenses, client invoices and payments" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard loading={loading} label="Approved spend" icon={Wallet} value={formatUGXCompact(approvedSpend)} hint={`of ${formatUGXCompact(totalBudget)} total budget`} emphasis={totalBudget && approvedSpend > totalBudget ? "danger" : undefined} />
          <StatCard loading={loading} label="Awaiting approval" icon={Receipt} value={pending.length} hint={pending.length ? formatUGXCompact(pendingAmount) : "Nothing waiting"} />
          <StatCard loading={loading} label="Owed by clients" icon={FileText} value={formatUGXCompact(receivable)} hint={overdueCount ? `${overdueCount} invoice${overdueCount === 1 ? "" : "s"} past due` : "Nothing past due"} emphasis={overdueCount ? "danger" : undefined} />
          <StatCard loading={loading} label="Net cash" icon={CreditCard} value={formatUGXCompact(moneyIn - moneyOut)} hint={`In ${formatUGXCompact(moneyIn)} · Out ${formatUGXCompact(moneyOut)}`} emphasis={moneyIn - moneyOut < 0 ? "danger" : undefined} />
        </div>

        {chartData.length > 0 && (
          <SectionCard title="Budget and approved spend by project">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barGap={3} margin={{ left: -8, right: 4 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={0} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatUGXCompact(v, false)} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} formatter={(v: number) => formatUGX(v)} contentStyle={{ borderRadius: 6, border: "1px solid hsl(var(--border))", fontSize: 13 }} />
                <Legend iconType="square" wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="Budget" fill="hsl(var(--navy))" radius={[3, 3, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Spent" fill="hsl(var(--smk-red))" radius={[3, 3, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        )}

        {!loading && !projects.length && (
          <Card>
            <EmptyState icon={Wallet} title="Create a project first" description="Budgets, expenses, invoices and payments all belong to a project." action={can.manageProjects && <Button asChild><Link to="/dashboard/projects?new=1">New project</Link></Button>} />
          </Card>
        )}

        <Tabs defaultValue="expenses">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="expenses">Expenses{pending.length ? ` (${pending.length} to approve)` : ""}</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="budgets">Budget lines</TabsTrigger>
          </TabsList>

          {/* Expenses */}
          <TabsContent value="expenses" className="mt-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Select value={expenseFilter} onValueChange={setExpenseFilter}>
                <SelectTrigger className="w-full bg-card sm:w-52" aria-label="Filter expenses"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All expenses</SelectItem>
                  {expenseStatus.list.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {can.submitExpenses && (
                <ExpenseDialog open={open === "expense"} onOpenChange={(v) => setOpen(v ? "expense" : null)} projects={projects as Option[]} onSaved={fetchAll} trigger={<Button disabled={!projects.length}><Plus /> Record expense</Button>} />
              )}
            </div>
            {loading ? <LoadingRows /> : shownExpenses.length === 0 ? (
              <Card><EmptyState compact icon={Receipt} title={expenseFilter === "pending" ? "No expenses waiting for approval" : "No expenses here"} /></Card>
            ) : (
              <Card className="divide-y">
                {shownExpenses.map((e) => {
                  const own = e.submitted_by === user?.id && !can.isAdmin;
                  return (
                    <div key={e.id} className="flex flex-col gap-2 p-4 md:flex-row md:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground">{e.category}</div>
                        <div className="text-sm text-muted-foreground">
                          <Link to={`/dashboard/projects/${e.project_id}`} className="hover:text-primary hover:underline">{e.projects?.name}</Link>
                          {" · "}
                          {[e.vendor, formatDate(e.expense_date), e.submitted_by && `submitted by ${nameOf(e.submitted_by)}`].filter(Boolean).join(" · ")}
                        </div>
                        {e.status !== "pending" && e.approved_by && (
                          <div className="text-xs text-muted-foreground">{e.status === "approved" ? "Approved" : "Rejected"} by {nameOf(e.approved_by)}</div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tabular font-semibold text-foreground">{formatUGX(e.amount)}</span>
                        {e.status === "pending" && can.approveExpenses && !own ? (
                          <>
                            <Button size="sm" variant="outline" className="h-8 border-success/40 text-success hover:bg-success/10 hover:text-success" onClick={() => mutate(supabase.from("expenses").update({ status: "approved", approved_by: user?.id }).eq("id", e.id), "Couldn't approve", "Expense approved")}>
                              <Check /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => mutate(supabase.from("expenses").update({ status: "rejected", approved_by: user?.id }).eq("id", e.id), "Couldn't reject", "Expense rejected")}>
                              <X /> Reject
                            </Button>
                          </>
                        ) : (
                          <StatusBadge tone={expenseStatus.tone(e.status)}>
                            {e.status === "pending" && own && can.approveExpenses ? "Needs another approver" : expenseStatus.label(e.status)}
                          </StatusBadge>
                        )}
                        {can.deleteFinance && (
                          <ConfirmDelete title="Delete expense?" description={`${e.category} (${formatUGX(e.amount)}) will be permanently deleted.`} onConfirm={() => mutate(supabase.from("expenses").delete().eq("id", e.id), "Couldn't delete expense")} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </Card>
            )}
          </TabsContent>

          {/* Invoices */}
          <TabsContent value="invoices" className="mt-4 space-y-3">
            {can.manageInvoices && (
              <div className="flex justify-end">
                <InvoiceDialog open={open === "invoice"} onOpenChange={(v) => setOpen(v ? "invoice" : null)} projects={projects as Option[]} suggestedNumber={suggestedInvoiceNumber} onSaved={fetchAll} trigger={<Button disabled={!projects.length}><Plus /> New invoice</Button>} />
              </div>
            )}
            {loading ? <LoadingRows /> : invoices.length === 0 ? (
              <Card><EmptyState compact icon={FileText} title="No invoices yet" description="Invoice clients per project stage and track what's been paid." /></Card>
            ) : (
              <Card className="overflow-x-auto">
                <table className="tabular w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Invoice</th>
                      <th className="px-4 py-3 font-medium">Due</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                      <th className="px-4 py-3 text-right font-medium">Received</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      {can.deleteFinance && <th className="w-10" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.map((inv) => {
                      const status = effectiveStatus(inv);
                      const received = paidOn(inv.id);
                      return (
                        <tr key={inv.id}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{inv.invoice_number}</div>
                            <div className="text-muted-foreground">{[inv.client_name, inv.projects?.name].filter(Boolean).join(" · ")}</div>
                          </td>
                          <td className={cn("px-4 py-3", status === "overdue" ? "font-medium text-destructive" : "text-muted-foreground")}>{inv.due_date ? formatDate(inv.due_date) : "—"}</td>
                          <td className="px-4 py-3 text-right font-medium text-foreground">{formatUGX(inv.total_amount)}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{received ? formatUGX(received) : "—"}</td>
                          <td className="px-4 py-3">
                            {can.manageInvoices ? (
                              <Select value={inv.status} onValueChange={(v) => mutate(supabase.from("invoices").update({ status: v, paid_date: v === "paid" ? inv.paid_date ?? new Date().toISOString().slice(0, 10) : null }).eq("id", inv.id), "Couldn't update invoice")}>
                                <SelectTrigger className={cn("h-8 w-36", status === "overdue" && "border-destructive/50 text-destructive")} aria-label={`Status of ${inv.invoice_number}`}>
                                  <SelectValue>{invoiceStatus.label(status)}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>{invoiceStatus.list.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                              </Select>
                            ) : (
                              <StatusBadge tone={invoiceStatus.tone(status)}>{invoiceStatus.label(status)}</StatusBadge>
                            )}
                          </td>
                          {can.deleteFinance && (
                            <td className="pr-2">
                              <ConfirmDelete title="Delete invoice?" description={`${inv.invoice_number} will be deleted. Linked payments are kept but unlinked.`} onConfirm={() => mutate(supabase.from("invoices").delete().eq("id", inv.id), "Couldn't delete invoice")} />
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments" className="mt-4 space-y-3">
            {can.managePayments && (
              <div className="flex justify-end">
                <PaymentDialog open={open === "payment"} onOpenChange={(v) => setOpen(v ? "payment" : null)} projects={projects as Option[]} invoices={invoices} onSaved={fetchAll} trigger={<Button disabled={!projects.length}><Plus /> Record payment</Button>} />
              </div>
            )}
            {loading ? <LoadingRows /> : payments.length === 0 ? (
              <Card><EmptyState compact icon={CreditCard} title="No payments recorded" /></Card>
            ) : (
              <Card className="divide-y">
                {payments.map((pm) => {
                  const incoming = pm.payment_type === "incoming";
                  return (
                    <div key={pm.id} className="flex items-center gap-3 p-4">
                      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", incoming ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                        {incoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground">
                          {incoming ? "Received" : "Paid out"}
                          {pm.invoices?.invoice_number && <span className="font-normal text-muted-foreground"> for {pm.invoices.invoice_number}</span>}
                        </div>
                        <div className="truncate text-sm text-muted-foreground">
                          {[pm.projects?.name, pm.payment_method, pm.reference_number && `Ref ${pm.reference_number}`, formatDate(pm.payment_date)].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <span className={cn("tabular whitespace-nowrap font-semibold", incoming ? "text-success" : "text-destructive")}>
                        {incoming ? "+" : "−"}{formatUGX(pm.amount)}
                      </span>
                      {can.deleteFinance && (
                        <ConfirmDelete title="Delete payment?" description={`This ${formatUGX(pm.amount)} payment record will be permanently deleted.`} onConfirm={() => mutate(supabase.from("payments").delete().eq("id", pm.id), "Couldn't delete payment")} />
                      )}
                    </div>
                  );
                })}
              </Card>
            )}
          </TabsContent>

          {/* Budget lines */}
          <TabsContent value="budgets" className="mt-4 space-y-3">
            {can.manageBudgets && (
              <div className="flex justify-end">
                <BudgetLineDialog open={open === "budget"} onOpenChange={(v) => setOpen(v ? "budget" : null)} projects={projects as Option[]} onSaved={fetchAll} trigger={<Button disabled={!projects.length}><Plus /> Add budget line</Button>} />
              </div>
            )}
            {loading ? <LoadingRows /> : budgets.length === 0 ? (
              <Card><EmptyState compact icon={Wallet} title="No budget lines yet" /></Card>
            ) : (
              <Card className="overflow-x-auto">
                <table className="tabular w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Project</th>
                      <th className="px-4 py-3 text-right font-medium">Planned</th>
                      <th className="px-4 py-3 text-right font-medium">Actual</th>
                      <th className="px-4 py-3 text-right font-medium">Difference</th>
                      {can.manageBudgets && <th className="w-10" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {budgets.map((b) => {
                      const actual = Number(b.actual_amount || 0);
                      const diff = Number(b.estimated_amount) - actual;
                      return (
                        <tr key={b.id}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{b.category}</div>
                            {b.description && <div className="text-muted-foreground">{b.description}</div>}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{b.projects?.name}</td>
                          <td className="px-4 py-3 text-right text-foreground">{formatUGX(b.estimated_amount)}</td>
                          <td className="px-4 py-3 text-right text-foreground">{actual ? formatUGX(actual) : <span className="text-muted-foreground">—</span>}</td>
                          <td className={cn("px-4 py-3 text-right font-medium", !actual ? "text-muted-foreground" : diff < 0 ? "text-destructive" : "text-success")}>
                            {!actual ? "—" : diff < 0 ? `${formatUGX(-diff)} over` : `${formatUGX(diff)} under`}
                          </td>
                          {can.manageBudgets && (
                            <td className="pr-2">
                              <ConfirmDelete title="Delete budget line?" description={`"${b.category}" will be removed.`} onConfirm={() => mutate(supabase.from("project_budgets").delete().eq("id", b.id), "Couldn't delete budget line")} />
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Finance;
