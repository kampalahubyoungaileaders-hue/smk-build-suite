export type Tone = "neutral" | "info" | "warning" | "success" | "danger" | "brand";

export const toneClasses: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  danger: "bg-red-50 text-red-800 border-red-200",
  brand: "bg-primary/10 text-primary border-primary/20",
};

interface Option {
  value: string;
  label: string;
  tone: Tone;
}

const make = (list: Option[]) => ({
  list,
  label: (v?: string | null) => list.find((o) => o.value === v)?.label ?? (v || "—"),
  tone: (v?: string | null): Tone => list.find((o) => o.value === v)?.tone ?? "neutral",
});

export const projectStatus = make([
  { value: "planning", label: "Planning", tone: "neutral" },
  { value: "in_progress", label: "In progress", tone: "info" },
  { value: "on_hold", label: "On hold", tone: "warning" },
  { value: "completed", label: "Completed", tone: "success" },
  { value: "cancelled", label: "Cancelled", tone: "danger" },
]);

export const taskStatus = make([
  { value: "todo", label: "To do", tone: "neutral" },
  { value: "in_progress", label: "In progress", tone: "info" },
  { value: "blocked", label: "Blocked", tone: "danger" },
  { value: "completed", label: "Done", tone: "success" },
]);

export const taskPriority = make([
  { value: "low", label: "Low", tone: "neutral" },
  { value: "medium", label: "Medium", tone: "info" },
  { value: "high", label: "High", tone: "warning" },
  { value: "critical", label: "Critical", tone: "danger" },
]);

export const expenseStatus = make([
  { value: "pending", label: "Awaiting approval", tone: "warning" },
  { value: "approved", label: "Approved", tone: "success" },
  { value: "rejected", label: "Rejected", tone: "danger" },
]);

export const invoiceStatus = make([
  { value: "draft", label: "Draft", tone: "neutral" },
  { value: "sent", label: "Sent", tone: "info" },
  { value: "overdue", label: "Overdue", tone: "danger" },
  { value: "paid", label: "Paid", tone: "success" },
  { value: "cancelled", label: "Cancelled", tone: "neutral" },
]);

export const appRole = make([
  { value: "admin", label: "Administrator", tone: "brand" },
  { value: "project_manager", label: "Project manager", tone: "info" },
  { value: "site_supervisor", label: "Site supervisor", tone: "warning" },
  { value: "contractor", label: "Contractor", tone: "success" },
  { value: "viewer", label: "Viewer", tone: "neutral" },
]);

export const ACTIVE_PROJECT_STATUSES = ["planning", "in_progress", "on_hold"];
