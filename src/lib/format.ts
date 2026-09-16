const ugx = new Intl.NumberFormat("en-UG", { maximumFractionDigits: 0 });

/** UGX 12,500,000 */
export const formatUGX = (value: number | string | null | undefined) =>
  `UGX ${ugx.format(Number(value || 0))}`;

/** UGX 12.5M / UGX 850K — for tight spaces like stat cards and chart axes */
export const formatUGXCompact = (value: number | string | null | undefined, withPrefix = true) => {
  const n = Number(value || 0);
  const abs = Math.abs(n);
  let out: string;
  if (abs >= 1e9) out = `${(n / 1e9).toFixed(abs >= 1e10 ? 0 : 1)}B`;
  else if (abs >= 1e6) out = `${(n / 1e6).toFixed(abs >= 1e7 ? 0 : 1)}M`;
  else if (abs >= 1e3) out = `${Math.round(n / 1e3)}K`;
  else out = `${Math.round(n)}`;
  return withPrefix ? `UGX ${out}` : out;
};

/** Parse a Postgres DATE ("2026-09-16") as a local date, not UTC midnight. */
export const parseDate = (value: string) => {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const formatDate = (value: string | null | undefined, opts: { year?: boolean } = { year: true }) => {
  if (!value) return "";
  return parseDate(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(opts.year ? { year: "numeric" } : {}),
  });
};

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** True only when the due date is strictly before today (a task due today is not overdue). */
export const isOverdue = (due: string | null | undefined) => !!due && due.slice(0, 10) < todayISO();

export const daysUntil = (due: string) => {
  const ms = parseDate(due).getTime() - parseDate(todayISO()).getTime();
  return Math.round(ms / 86_400_000);
};

export const initials = (name?: string | null) =>
  (name || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

/** Build a CSV string that is safe to open in Excel (quotes escaped, formula injection neutralised). */
export const toCSV = (header: string[], rows: (string | number | null | undefined)[][]) => {
  const cell = (v: string | number | null | undefined) => {
    if (typeof v === "number") return String(v);
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [header.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))].join("\r\n");
};

export const downloadFile = (content: string, filename: string, type = "text/csv;charset=utf-8") => {
  const blob = new Blob(["\uFEFF" + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
