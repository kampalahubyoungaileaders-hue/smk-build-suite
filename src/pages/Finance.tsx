import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, TrendingUp, TrendingDown, Wallet, Receipt, FileText, CreditCard } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Finance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Budget form
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ project_id: "", category: "", description: "", estimated_amount: "", actual_amount: "" });

  // Expense form
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ project_id: "", category: "", description: "", amount: "", vendor: "", expense_date: "" });

  // Invoice form
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ project_id: "", invoice_number: "", client_name: "", description: "", subtotal: "", tax_amount: "", due_date: "" });

  // Payment form
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ project_id: "", payment_type: "incoming", amount: "", payment_method: "", reference_number: "", description: "", payment_date: "" });

  const fetchAll = async () => {
    const [pRes, bRes, eRes, iRes, pmRes] = await Promise.all([
      supabase.from("projects").select("id, name"),
      supabase.from("project_budgets").select("*, projects(name)").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*, projects(name)").order("expense_date", { ascending: false }),
      supabase.from("invoices").select("*, projects(name)").order("created_at", { ascending: false }),
      supabase.from("payments").select("*, projects(name)").order("payment_date", { ascending: false }),
    ]);
    setProjects(pRes.data || []);
    setBudgets(bRes.data || []);
    setExpenses(eRes.data || []);
    setInvoices(iRes.data || []);
    setPayments(pmRes.data || []);
  };

  useEffect(() => { fetchAll(); }, []);

  const totalBudget = budgets.reduce((s, b) => s + Number(b.estimated_amount || 0), 0);
  const totalActual = budgets.reduce((s, b) => s + Number(b.actual_amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const totalPaidInvoices = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const totalIncoming = payments.filter((p) => p.payment_type === "incoming").reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalOutgoing = payments.filter((p) => p.payment_type === "outgoing").reduce((s, p) => s + Number(p.amount || 0), 0);

  // Budget chart data
  const budgetByProject: Record<string, { name: string; estimated: number; actual: number }> = {};
  budgets.forEach((b) => {
    const pName = (b.projects as any)?.name || "Unknown";
    if (!budgetByProject[b.project_id]) budgetByProject[b.project_id] = { name: pName, estimated: 0, actual: 0 };
    budgetByProject[b.project_id].estimated += Number(b.estimated_amount || 0);
    budgetByProject[b.project_id].actual += Number(b.actual_amount || 0);
  });
  const chartData = Object.values(budgetByProject);

  const handleBudgetCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetLoading(true);
    const { error } = await supabase.from("project_budgets").insert({
      project_id: budgetForm.project_id,
      category: budgetForm.category,
      description: budgetForm.description || null,
      estimated_amount: Number(budgetForm.estimated_amount),
      actual_amount: budgetForm.actual_amount ? Number(budgetForm.actual_amount) : 0,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Budget item added" }); setBudgetOpen(false); setBudgetForm({ project_id: "", category: "", description: "", estimated_amount: "", actual_amount: "" }); fetchAll(); }
    setBudgetLoading(false);
  };

  const handleExpenseCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseLoading(true);
    const { error } = await supabase.from("expenses").insert({
      project_id: expenseForm.project_id,
      category: expenseForm.category,
      description: expenseForm.description || null,
      amount: Number(expenseForm.amount),
      vendor: expenseForm.vendor || null,
      expense_date: expenseForm.expense_date || new Date().toISOString().split("T")[0],
      submitted_by: user?.id,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Expense recorded" }); setExpenseOpen(false); setExpenseForm({ project_id: "", category: "", description: "", amount: "", vendor: "", expense_date: "" }); fetchAll(); }
    setExpenseLoading(false);
  };

  const handleInvoiceCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvoiceLoading(true);
    const subtotal = Number(invoiceForm.subtotal);
    const tax = Number(invoiceForm.tax_amount || 0);
    const { error } = await supabase.from("invoices").insert({
      project_id: invoiceForm.project_id,
      invoice_number: invoiceForm.invoice_number,
      client_name: invoiceForm.client_name || null,
      description: invoiceForm.description || null,
      subtotal,
      tax_amount: tax,
      total_amount: subtotal + tax,
      due_date: invoiceForm.due_date || null,
      created_by: user?.id,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Invoice created" }); setInvoiceOpen(false); setInvoiceForm({ project_id: "", invoice_number: "", client_name: "", description: "", subtotal: "", tax_amount: "", due_date: "" }); fetchAll(); }
    setInvoiceLoading(false);
  };

  const handlePaymentCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    const { error } = await supabase.from("payments").insert({
      project_id: paymentForm.project_id,
      payment_type: paymentForm.payment_type,
      amount: Number(paymentForm.amount),
      payment_method: paymentForm.payment_method || null,
      reference_number: paymentForm.reference_number || null,
      description: paymentForm.description || null,
      payment_date: paymentForm.payment_date || new Date().toISOString().split("T")[0],
      recorded_by: user?.id,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Payment recorded" }); setPaymentOpen(false); setPaymentForm({ project_id: "", payment_type: "incoming", amount: "", payment_method: "", reference_number: "", description: "", payment_date: "" }); fetchAll(); }
    setPaymentLoading(false);
  };

  const handleExpenseApproval = async (expenseId: string, status: string) => {
    const { error } = await supabase.from("expenses").update({ status, approved_by: user?.id }).eq("id", expenseId);
    if (!error) fetchAll();
  };

  const handleInvoiceStatusChange = async (invoiceId: string, status: string) => {
    const update: any = { status };
    if (status === "paid") update.paid_date = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("invoices").update(update).eq("id", invoiceId);
    if (!error) fetchAll();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Finance</h2>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Budget</span>
              <div className="p-1.5 rounded-lg bg-primary/10"><Wallet size={14} className="text-primary" /></div>
            </div>
            <div className="text-xl font-bold text-foreground">UGX {totalBudget.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Actual: UGX {totalActual.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Expenses</span>
              <div className="p-1.5 rounded-lg bg-accent/10"><Receipt size={14} className="text-accent" /></div>
            </div>
            <div className="text-xl font-bold text-foreground">UGX {totalExpenses.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">{expenses.length} records</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Invoiced</span>
              <div className="p-1.5 rounded-lg bg-blue-50"><FileText size={14} className="text-blue-600" /></div>
            </div>
            <div className="text-xl font-bold text-foreground">UGX {totalInvoiced.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Paid: UGX {totalPaidInvoices.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Cash Flow</span>
              <div className="p-1.5 rounded-lg bg-green-50"><CreditCard size={14} className="text-green-600" /></div>
            </div>
            <div className="text-xl font-bold text-foreground">
              UGX {(totalIncoming - totalOutgoing).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              In: {totalIncoming.toLocaleString()} / Out: {totalOutgoing.toLocaleString()}
            </div>
          </Card>
        </div>

        {/* Budget chart */}
        {chartData.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3">Budget vs Actual by Project</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                <Tooltip formatter={(value: number) => `UGX ${value.toLocaleString()}`} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", fontSize: "12px" }} />
                <Bar dataKey="estimated" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Estimated" />
                <Bar dataKey="actual" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="budgets">
          <TabsList>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Budgets */}
          <TabsContent value="budgets" className="space-y-3">
            <div className="flex justify-end">
              <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground"><Plus size={14} className="mr-1" /> Add Budget Item</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Budget Item</DialogTitle></DialogHeader>
                  <form onSubmit={handleBudgetCreate} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Project *</Label>
                      <Select value={budgetForm.project_id} onValueChange={(v) => setBudgetForm({ ...budgetForm, project_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                        <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Category *</Label>
                      <Input value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })} required placeholder="e.g. Materials, Labour, Equipment" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Input value={budgetForm.description} onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Estimated (UGX)</Label><Input type="number" value={budgetForm.estimated_amount} onChange={(e) => setBudgetForm({ ...budgetForm, estimated_amount: e.target.value })} required /></div>
                      <div className="space-y-1.5"><Label>Actual (UGX)</Label><Input type="number" value={budgetForm.actual_amount} onChange={(e) => setBudgetForm({ ...budgetForm, actual_amount: e.target.value })} /></div>
                    </div>
                    <Button type="submit" disabled={budgetLoading || !budgetForm.project_id} className="w-full bg-primary text-primary-foreground font-semibold">{budgetLoading ? "Adding..." : "Add Budget Item"}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {budgets.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">No budget items yet</Card>
            ) : (
              <div className="space-y-2">
                {budgets.map((b) => {
                  const variance = Number(b.estimated_amount) - Number(b.actual_amount || 0);
                  return (
                    <Card key={b.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-foreground">{b.category}</div>
                        <div className="text-xs text-muted-foreground">{(b.projects as any)?.name}{b.description ? ` · ${b.description}` : ""}</div>
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

          {/* Expenses */}
          <TabsContent value="expenses" className="space-y-3">
            <div className="flex justify-end">
              <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground"><Plus size={14} className="mr-1" /> Record Expense</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Record Expense</DialogTitle></DialogHeader>
                  <form onSubmit={handleExpenseCreate} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Project *</Label>
                      <Select value={expenseForm.project_id} onValueChange={(v) => setExpenseForm({ ...expenseForm, project_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                        <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Category *</Label><Input value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} required placeholder="e.g. Cement, Steel" /></div>
                      <div className="space-y-1.5"><Label>Amount (UGX) *</Label><Input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Vendor</Label><Input value={expenseForm.vendor} onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })} placeholder="Supplier name" /></div>
                      <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} /></div>
                    </div>
                    <div className="space-y-1.5"><Label>Description</Label><Input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} /></div>
                    <Button type="submit" disabled={expenseLoading || !expenseForm.project_id} className="w-full bg-primary text-primary-foreground font-semibold">{expenseLoading ? "Recording..." : "Record Expense"}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {expenses.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">No expenses recorded</Card>
            ) : (
              <div className="space-y-2">
                {expenses.map((e) => (
                  <Card key={e.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-foreground">{e.category}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {(e.projects as any)?.name}{e.vendor ? ` · ${e.vendor}` : ""} · {new Date(e.expense_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {e.status === "pending" ? (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-300" onClick={() => handleExpenseApproval(e.id, "approved")}>Approve</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30" onClick={() => handleExpenseApproval(e.id, "rejected")}>Reject</Button>
                        </div>
                      ) : (
                        <Badge variant="secondary" className={`text-[10px] ${e.status === "approved" ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                          {e.status}
                        </Badge>
                      )}
                      <span className="font-medium text-sm text-foreground whitespace-nowrap">UGX {Number(e.amount).toLocaleString()}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invoices */}
          <TabsContent value="invoices" className="space-y-3">
            <div className="flex justify-end">
              <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground"><Plus size={14} className="mr-1" /> Create Invoice</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
                  <form onSubmit={handleInvoiceCreate} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Project *</Label>
                        <Select value={invoiceForm.project_id} onValueChange={(v) => setInvoiceForm({ ...invoiceForm, project_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5"><Label>Invoice # *</Label><Input value={invoiceForm.invoice_number} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })} required placeholder="INV-001" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Client</Label><Input value={invoiceForm.client_name} onChange={(e) => setInvoiceForm({ ...invoiceForm, client_name: e.target.value })} /></div>
                      <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={invoiceForm.due_date} onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })} /></div>
                    </div>
                    <div className="space-y-1.5"><Label>Description</Label><Input value={invoiceForm.description} onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Subtotal (UGX) *</Label><Input type="number" value={invoiceForm.subtotal} onChange={(e) => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })} required /></div>
                      <div className="space-y-1.5"><Label>Tax (UGX)</Label><Input type="number" value={invoiceForm.tax_amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, tax_amount: e.target.value })} /></div>
                    </div>
                    <Button type="submit" disabled={invoiceLoading || !invoiceForm.project_id || !invoiceForm.invoice_number} className="w-full bg-primary text-primary-foreground font-semibold">{invoiceLoading ? "Creating..." : "Create Invoice"}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {invoices.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">No invoices yet</Card>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <Card key={inv.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-foreground">{inv.invoice_number}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {(inv.projects as any)?.name}{inv.client_name ? ` · ${inv.client_name}` : ""}
                        {inv.due_date && ` · Due ${new Date(inv.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select value={inv.status} onValueChange={(v) => handleInvoiceStatusChange(inv.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["draft", "sent", "paid", "overdue", "cancelled"].map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="font-medium text-sm text-foreground whitespace-nowrap">UGX {Number(inv.total_amount).toLocaleString()}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments" className="space-y-3">
            <div className="flex justify-end">
              <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground"><Plus size={14} className="mr-1" /> Record Payment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
                  <form onSubmit={handlePaymentCreate} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Project *</Label>
                        <Select value={paymentForm.project_id} onValueChange={(v) => setPaymentForm({ ...paymentForm, project_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Type *</Label>
                        <Select value={paymentForm.payment_type} onValueChange={(v) => setPaymentForm({ ...paymentForm, payment_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="incoming">Incoming</SelectItem>
                            <SelectItem value="outgoing">Outgoing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Amount (UGX) *</Label><Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} required /></div>
                      <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Method</Label><Input value={paymentForm.payment_method} onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })} placeholder="e.g. Mobile Money, Bank" /></div>
                      <div className="space-y-1.5"><Label>Reference #</Label><Input value={paymentForm.reference_number} onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })} /></div>
                    </div>
                    <div className="space-y-1.5"><Label>Description</Label><Input value={paymentForm.description} onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })} /></div>
                    <Button type="submit" disabled={paymentLoading || !paymentForm.project_id} className="w-full bg-primary text-primary-foreground font-semibold">{paymentLoading ? "Recording..." : "Record Payment"}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {payments.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground text-sm">No payments recorded</Card>
            ) : (
              <div className="space-y-2">
                {payments.map((pm) => (
                  <Card key={pm.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {pm.payment_type === "incoming" ? (
                          <TrendingUp size={14} className="text-green-600 shrink-0" />
                        ) : (
                          <TrendingDown size={14} className="text-destructive shrink-0" />
                        )}
                        <span className="font-medium text-sm text-foreground capitalize">{pm.payment_type}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {(pm.projects as any)?.name}
                        {pm.payment_method ? ` · ${pm.payment_method}` : ""}
                        {pm.reference_number ? ` · Ref: ${pm.reference_number}` : ""}
                        {` · ${new Date(pm.payment_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                      </div>
                    </div>
                    <span className={`font-medium text-sm whitespace-nowrap ${pm.payment_type === "incoming" ? "text-green-600" : "text-destructive"}`}>
                      {pm.payment_type === "incoming" ? "+" : "-"}UGX {Number(pm.amount).toLocaleString()}
                    </span>
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

export default Finance;
