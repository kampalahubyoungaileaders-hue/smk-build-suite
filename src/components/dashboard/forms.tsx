import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, describeError } from "@/components/dashboard/ui";
import { taskPriority, taskStatus } from "@/lib/status";
import { formatUGX, todayISO } from "@/lib/format";

import type { Enums, Option, Person, Row } from "@/lib/db";

const UNASSIGNED = "__none";

/* ------------------------------------------------------------------ */
/* Generic shell                                                       */
/* ------------------------------------------------------------------ */

const FormDialog = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  onSubmit,
  saving,
  canSubmit,
  submitLabel,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  onSubmit: () => void;
  saving: boolean;
  canSubmit: boolean;
  submitLabel: string;
  children: ReactNode;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
    <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit && !saving) onSubmit();
        }}
      >
        {children}
        <DialogFooter className="gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={saving || !canSubmit}>{saving ? "Saving…" : submitLabel}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

const ProjectSelect = ({ value, onChange, projects }: { value: string; onChange: (v: string) => void; projects: Option[] }) => (
  <Field label="Project" required>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Choose a project" /></SelectTrigger>
      <SelectContent>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </Field>
);

const useSave = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const run = async (fn: () => PromiseLike<{ error: { message: string } | null }>, ok: string, fail: string) => {
    setSaving(true);
    const { error } = await fn();
    setSaving(false);
    if (error) {
      toast({ title: fail, description: describeError(error.message), variant: "destructive" });
      return false;
    }
    toast({ title: ok });
    return true;
  };
  return { saving, run };
};

/* ------------------------------------------------------------------ */
/* Task                                                                */
/* ------------------------------------------------------------------ */

export const TaskFormDialog = ({
  open,
  onOpenChange,
  trigger,
  task,
  projectId,
  projects = [],
  people,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger?: ReactNode;
  task?: Row;
  projectId?: string;
  projects?: Option[];
  people: Person[];
  onSaved: () => void;
}) => {
  const blank = { project_id: projectId ?? "", title: "", description: "", priority: "medium", status: "todo", due_date: "", assigned_to: UNASSIGNED };
  const [form, setForm] = useState(blank);
  const { saving, run } = useSave();

  useEffect(() => {
    if (!open) return;
    setForm(
      task
        ? {
            project_id: task.project_id,
            title: task.title ?? "",
            description: task.description ?? "",
            priority: task.priority,
            status: task.status,
            due_date: task.due_date ?? "",
            assigned_to: task.assigned_to ?? UNASSIGNED,
          }
        : { ...blank, project_id: projectId ?? "" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task, projectId]);

  const submit = async () => {
    const payload = {
      project_id: form.project_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority as Enums<"task_priority">,
      status: form.status as Enums<"task_status">,
      due_date: form.due_date || null,
      assigned_to: form.assigned_to === UNASSIGNED ? null : form.assigned_to,
      progress: form.status === "completed" ? 100 : undefined,
    };
    const ok = await run(
      () => (task ? supabase.from("project_tasks").update(payload).eq("id", task.id) : supabase.from("project_tasks").insert(payload)),
      task ? "Task saved" : "Task added",
      task ? "Couldn't save task" : "Couldn't add task",
    );
    if (ok) {
      onOpenChange(false);
      onSaved();
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={task ? "Edit task" : "Add task"}
      onSubmit={submit}
      saving={saving}
      canSubmit={!!form.project_id && !!form.title.trim()}
      submitLabel={task ? "Save task" : "Add task"}
    >
      {!projectId && <ProjectSelect value={form.project_id} onChange={(v) => setForm({ ...form, project_id: v })} projects={projects} />}
      <Field label="Task" htmlFor="t-title" required>
        <Input id="t-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Cast ground floor slab" />
      </Field>
      <Field label="Notes" htmlFor="t-desc">
        <Textarea id="t-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Priority">
          <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{taskPriority.list.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{taskStatus.list.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Due date" htmlFor="t-due">
          <Input id="t-due" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        </Field>
      </div>
      <Field label="Assigned to">
        <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED}>Nobody yet</SelectItem>
            {people.map((p) => <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || "Unnamed user"}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
    </FormDialog>
  );
};

/* ------------------------------------------------------------------ */
/* Budget line                                                         */
/* ------------------------------------------------------------------ */

export const BudgetLineDialog = ({
  open,
  onOpenChange,
  trigger,
  projectId,
  projects = [],
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger?: ReactNode;
  projectId?: string;
  projects?: Option[];
  onSaved: () => void;
}) => {
  const [form, setForm] = useState({ project_id: projectId ?? "", category: "", description: "", estimated_amount: "", actual_amount: "" });
  const { saving, run } = useSave();
  useEffect(() => {
    if (open) setForm({ project_id: projectId ?? "", category: "", description: "", estimated_amount: "", actual_amount: "" });
  }, [open, projectId]);

  const submit = async () => {
    const ok = await run(
      () =>
        supabase.from("project_budgets").insert({
          project_id: form.project_id,
          category: form.category.trim(),
          description: form.description.trim() || null,
          estimated_amount: Math.max(0, Number(form.estimated_amount) || 0),
          actual_amount: form.actual_amount === "" ? 0 : Math.max(0, Number(form.actual_amount)),
        }),
      "Budget line added",
      "Couldn't add budget line",
    );
    if (ok) {
      onOpenChange(false);
      onSaved();
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title="Add budget line"
      description="Break the project budget into categories so you can see where money is planned to go."
      onSubmit={submit}
      saving={saving}
      canSubmit={!!form.project_id && !!form.category.trim() && form.estimated_amount !== ""}
      submitLabel="Add budget line"
    >
      {!projectId && <ProjectSelect value={form.project_id} onChange={(v) => setForm({ ...form, project_id: v })} projects={projects} />}
      <Field label="Category" htmlFor="b-cat" required>
        <Input id="b-cat" list="budget-categories" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Materials" />
        <datalist id="budget-categories">
          {["Materials", "Labour", "Equipment hire", "Transport", "Professional fees", "Permits & approvals", "Finishes", "Contingency"].map((c) => <option key={c} value={c} />)}
        </datalist>
      </Field>
      <Field label="Details" htmlFor="b-desc">
        <Input id="b-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Planned (UGX)" htmlFor="b-est" required>
          <Input id="b-est" type="number" inputMode="numeric" min={0} step="any" value={form.estimated_amount} onChange={(e) => setForm({ ...form, estimated_amount: e.target.value })} />
        </Field>
        <Field label="Actual so far (UGX)" htmlFor="b-act" hint="Leave blank if not yet known">
          <Input id="b-act" type="number" inputMode="numeric" min={0} step="any" value={form.actual_amount} onChange={(e) => setForm({ ...form, actual_amount: e.target.value })} />
        </Field>
      </div>
    </FormDialog>
  );
};

/* ------------------------------------------------------------------ */
/* Expense                                                             */
/* ------------------------------------------------------------------ */

export const ExpenseDialog = ({
  open,
  onOpenChange,
  trigger,
  projectId,
  projects = [],
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger?: ReactNode;
  projectId?: string;
  projects?: Option[];
  onSaved: () => void;
}) => {
  const { user } = useAuth();
  const blank = { project_id: projectId ?? "", category: "", description: "", amount: "", vendor: "", expense_date: todayISO() };
  const [form, setForm] = useState(blank);
  const { saving, run } = useSave();
  useEffect(() => {
    if (open) setForm({ ...blank, project_id: projectId ?? "", expense_date: todayISO() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId]);

  const submit = async () => {
    const ok = await run(
      () =>
        supabase.from("expenses").insert({
          project_id: form.project_id,
          category: form.category.trim(),
          description: form.description.trim() || null,
          amount: Number(form.amount),
          vendor: form.vendor.trim() || null,
          expense_date: form.expense_date || todayISO(),
          submitted_by: user?.id,
        }),
      "Expense submitted for approval",
      "Couldn't record expense",
    );
    if (ok) {
      onOpenChange(false);
      onSaved();
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title="Record expense"
      description="New expenses wait for approval by a project manager before they count as spend."
      onSubmit={submit}
      saving={saving}
      canSubmit={!!form.project_id && !!form.category.trim() && Number(form.amount) > 0}
      submitLabel="Submit expense"
    >
      {!projectId && <ProjectSelect value={form.project_id} onChange={(v) => setForm({ ...form, project_id: v })} projects={projects} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="What was bought" htmlFor="e-cat" required>
          <Input id="e-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Cement, 50 bags" />
        </Field>
        <Field label="Amount (UGX)" htmlFor="e-amt" required>
          <Input id="e-amt" type="number" inputMode="numeric" min={1} step="any" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Supplier" htmlFor="e-vendor">
          <Input id="e-vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
        </Field>
        <Field label="Date" htmlFor="e-date">
          <Input id="e-date" type="date" max={todayISO()} value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
        </Field>
      </div>
      <Field label="Notes" htmlFor="e-desc">
        <Input id="e-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Receipt number, delivery note, etc." />
      </Field>
    </FormDialog>
  );
};

/* ------------------------------------------------------------------ */
/* Invoice                                                             */
/* ------------------------------------------------------------------ */

export const InvoiceDialog = ({
  open,
  onOpenChange,
  trigger,
  projects,
  suggestedNumber,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger?: ReactNode;
  projects: (Option & { client_name?: string | null })[];
  suggestedNumber: string;
  onSaved: () => void;
}) => {
  const { user } = useAuth();
  const blank = { project_id: "", invoice_number: suggestedNumber, client_name: "", description: "", subtotal: "", tax_rate: "18", due_date: "" };
  const [form, setForm] = useState(blank);
  const { saving, run } = useSave();
  useEffect(() => {
    if (open) setForm({ ...blank, invoice_number: suggestedNumber });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, suggestedNumber]);

  const subtotal = Math.max(0, Number(form.subtotal) || 0);
  const tax = Math.round(subtotal * (Math.max(0, Number(form.tax_rate) || 0) / 100));

  const submit = async () => {
    const ok = await run(
      () =>
        supabase.from("invoices").insert({
          project_id: form.project_id,
          invoice_number: form.invoice_number.trim(),
          client_name: form.client_name.trim() || null,
          description: form.description.trim() || null,
          subtotal,
          tax_amount: tax,
          total_amount: subtotal + tax,
          issue_date: todayISO(),
          due_date: form.due_date || null,
          created_by: user?.id,
        }),
      "Invoice created",
      "Couldn't create invoice",
    );
    if (ok) {
      onOpenChange(false);
      onSaved();
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title="New invoice"
      onSubmit={submit}
      saving={saving}
      canSubmit={!!form.project_id && !!form.invoice_number.trim() && subtotal > 0}
      submitLabel="Create invoice"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ProjectSelect
          value={form.project_id}
          onChange={(v) => {
            const p = projects.find((x) => x.id === v);
            setForm((f) => ({ ...f, project_id: v, client_name: f.client_name || p?.client_name || "" }));
          }}
          projects={projects}
        />
        <Field label="Invoice number" htmlFor="i-num" required>
          <Input id="i-num" value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bill to" htmlFor="i-client">
          <Input id="i-client" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
        </Field>
        <Field label="Payment due" htmlFor="i-due">
          <Input id="i-due" type="date" min={todayISO()} value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        </Field>
      </div>
      <Field label="Description" htmlFor="i-desc">
        <Input id="i-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Stage 2: walling and ring beam" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount before tax (UGX)" htmlFor="i-sub" required>
          <Input id="i-sub" type="number" inputMode="numeric" min={0} step="any" value={form.subtotal} onChange={(e) => setForm({ ...form, subtotal: e.target.value })} />
        </Field>
        <Field label="VAT rate (%)" htmlFor="i-tax" hint="Uganda standard rate is 18%. Use 0 if exempt.">
          <Input id="i-tax" type="number" min={0} max={100} step="any" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
        </Field>
      </div>
      <div className="tabular rounded-md bg-muted px-4 py-3 text-sm">
        <div className="flex justify-between text-muted-foreground"><span>VAT</span><span>{formatUGX(tax)}</span></div>
        <div className="mt-1 flex justify-between font-semibold text-foreground"><span>Total</span><span>{formatUGX(subtotal + tax)}</span></div>
      </div>
    </FormDialog>
  );
};

/* ------------------------------------------------------------------ */
/* Payment                                                             */
/* ------------------------------------------------------------------ */

export const PaymentDialog = ({
  open,
  onOpenChange,
  trigger,
  projects,
  invoices,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger?: ReactNode;
  projects: Option[];
  invoices: Row[];
  onSaved: () => void;
}) => {
  const { user } = useAuth();
  const blank = { project_id: "", payment_type: "incoming", invoice_id: UNASSIGNED, amount: "", payment_method: "", reference_number: "", description: "", payment_date: todayISO() };
  const [form, setForm] = useState(blank);
  const { saving, run } = useSave();
  useEffect(() => {
    if (open) setForm({ ...blank, payment_date: todayISO() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const openInvoices = invoices.filter(
    (i) => i.project_id === form.project_id && ["sent", "overdue", "draft"].includes(i.status),
  );

  const submit = async () => {
    const invoiceId = form.payment_type === "incoming" && form.invoice_id !== UNASSIGNED ? form.invoice_id : null;
    const ok = await run(
      () =>
        supabase.from("payments").insert({
          project_id: form.project_id,
          payment_type: form.payment_type,
          invoice_id: invoiceId,
          amount: Number(form.amount),
          payment_method: form.payment_method || null,
          reference_number: form.reference_number.trim() || null,
          description: form.description.trim() || null,
          payment_date: form.payment_date || todayISO(),
          recorded_by: user?.id,
        }),
      "Payment recorded",
      "Couldn't record payment",
    );
    if (ok) {
      onOpenChange(false);
      onSaved();
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title="Record payment"
      description="Payments linked to an invoice mark it as paid automatically once the full amount is received."
      onSubmit={submit}
      saving={saving}
      canSubmit={!!form.project_id && Number(form.amount) > 0}
      submitLabel="Record payment"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ProjectSelect value={form.project_id} onChange={(v) => setForm({ ...form, project_id: v, invoice_id: UNASSIGNED })} projects={projects} />
        <Field label="Direction" required>
          <Select value={form.payment_type} onValueChange={(v) => setForm({ ...form, payment_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="incoming">Money in (from client)</SelectItem>
              <SelectItem value="outgoing">Money out (to supplier)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      {form.payment_type === "incoming" && (
        <Field label="Against invoice">
          <Select value={form.invoice_id} onValueChange={(v) => {
            const inv = invoices.find((i) => i.id === v);
            setForm({ ...form, invoice_id: v, amount: form.amount || (inv ? String(inv.total_amount) : "") });
          }} disabled={!form.project_id}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>Not linked to an invoice</SelectItem>
              {openInvoices.map((i) => (
                <SelectItem key={i.id} value={i.id}>{i.invoice_number} · {formatUGX(i.total_amount)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount (UGX)" htmlFor="pm-amt" required>
          <Input id="pm-amt" type="number" inputMode="numeric" min={1} step="any" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </Field>
        <Field label="Date" htmlFor="pm-date">
          <Input id="pm-date" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Method">
          <Select value={form.payment_method || UNASSIGNED} onValueChange={(v) => setForm({ ...form, payment_method: v === UNASSIGNED ? "" : v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>Not specified</SelectItem>
              {["Bank transfer", "Mobile money", "Cash", "Cheque"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Reference" htmlFor="pm-ref">
          <Input id="pm-ref" value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} placeholder="Transaction ID" />
        </Field>
      </div>
      <Field label="Notes" htmlFor="pm-desc">
        <Input id="pm-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </Field>
    </FormDialog>
  );
};

/* ------------------------------------------------------------------ */
/* Team assignment                                                     */
/* ------------------------------------------------------------------ */

export const AssignMemberDialog = ({
  open,
  onOpenChange,
  trigger,
  projectId,
  projects = [],
  people,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger?: ReactNode;
  projectId?: string;
  projects?: Option[];
  people: Person[];
  onSaved: () => void;
}) => {
  const [form, setForm] = useState({ user_id: "", project_id: projectId ?? "", role: "" });
  const { saving, run } = useSave();
  useEffect(() => {
    if (open) setForm({ user_id: "", project_id: projectId ?? "", role: "" });
  }, [open, projectId]);

  const submit = async () => {
    const ok = await run(
      () =>
        supabase.from("team_members").insert({
          user_id: form.user_id,
          project_id: form.project_id,
          role: form.role.trim() || "Team member",
        }),
      "Added to project",
      "Couldn't add to project",
    );
    if (ok) {
      onOpenChange(false);
      onSaved();
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title="Add to project team"
      onSubmit={submit}
      saving={saving}
      canSubmit={!!form.user_id && !!form.project_id}
      submitLabel="Add to team"
    >
      <Field label="Person" required>
        <Select value={form.user_id} onValueChange={(v) => setForm({ ...form, user_id: v })}>
          <SelectTrigger><SelectValue placeholder="Choose a person" /></SelectTrigger>
          <SelectContent>
            {people.map((p) => <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || "Unnamed user"}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      {!projectId && <ProjectSelect value={form.project_id} onChange={(v) => setForm({ ...form, project_id: v })} projects={projects} />}
      <Field label="Role on this project" htmlFor="a-role">
        <Input id="a-role" list="site-roles" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Site engineer" />
        <datalist id="site-roles">
          {["Project lead", "Site engineer", "Foreman", "Quantity surveyor", "Architect", "Electrician", "Plumber", "Mason"].map((r) => <option key={r} value={r} />)}
        </datalist>
      </Field>
    </FormDialog>
  );
};
