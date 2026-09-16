import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tone, toneClasses } from "@/lib/status";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const PageHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-[28px] font-semibold leading-tight text-foreground">{title}</h1>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const StatusBadge = ({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium",
      toneClasses[tone],
      className,
    )}
  >
    {children}
  </span>
);

export const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  href,
  emphasis,
  loading,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  href?: string;
  emphasis?: "default" | "danger" | "success";
  loading?: boolean;
}) => {
  const body = (
    <Card
      className={cn(
        "h-full p-4 transition-colors",
        href && "hover:border-primary/40",
        emphasis === "danger" && "border-l-4 border-l-destructive",
        emphasis === "success" && "border-l-4 border-l-success",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && <Icon size={16} className="text-muted-foreground" aria-hidden />}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-24" />
      ) : (
        <div className="tabular mt-1 font-display text-[28px] font-semibold leading-tight text-foreground">{value}</div>
      )}
      {hint && !loading && <div className="tabular mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </Card>
  );
  return href ? (
    <Link to={href} className="block rounded-lg focus-visible:outline-offset-2">
      {body}
    </Link>
  ) : (
    body
  );
};

export const SectionCard = ({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <Card className={cn("p-4 sm:p-5", className)}>
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {action}
    </div>
    {children}
  </Card>
);

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  compact,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}) => (
  <div className={cn("flex flex-col items-center text-center", compact ? "py-6" : "py-12")}>
    {Icon && (
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon size={18} className="text-muted-foreground" aria-hidden />
      </div>
    )}
    <p className="font-medium text-foreground">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const LoadingRows = ({ rows = 4, className }: { rows?: number; className?: string }) => (
  <div className={cn("space-y-2", className)} aria-busy="true">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-14 w-full" />
    ))}
  </div>
);

export const Field = ({
  label,
  htmlFor,
  required,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("space-y-1.5", className)}>
    <Label htmlFor={htmlFor}>
      {label}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const ConfirmDelete = ({
  title,
  description,
  onConfirm,
  confirmLabel = "Delete",
  trigger,
}: {
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  confirmLabel?: string;
  trigger?: ReactNode;
}) => {
  const [busy, setBusy] = useState(false);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={title}
          >
            <Trash2 size={15} />
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async () => {
              setBusy(true);
              await onConfirm();
              setBusy(false);
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/** Consistent error toasts. RLS failures get a plain-language explanation. */
export const describeError = (message?: string) => {
  if (!message) return "Something went wrong. Try again.";
  if (/row-level security|permission denied/i.test(message))
    return "Your role doesn't allow this action. Ask an administrator if you need access.";
  if (/duplicate key.*invoice/i.test(message)) return "That invoice number is already in use.";
  return message;
};
