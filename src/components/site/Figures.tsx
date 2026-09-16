import { companyStats } from "@/content/company";
import { cn } from "@/lib/utils";

/** Company figures, each measured off with a drafting dimension line. */
const Figures = ({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) => (
  <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4", className)}>
    {companyStats.map((s) => (
      <div key={s.label} className="flex flex-col">
        <div aria-hidden className={cn("relative mb-5 h-3", tone === "dark" ? "text-white/40" : "text-navy/40")}>
          <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
          <span className="absolute left-0 top-0 h-3 w-px bg-current" />
          <span className="absolute right-0 top-0 h-3 w-px bg-current" />
        </div>
        <dt className={cn("order-2 mt-2 text-[15px]", tone === "dark" ? "text-white/75" : "text-muted-foreground")}>{s.label}</dt>
        <dd className={cn("text-display tabular text-6xl md:text-7xl", tone === "dark" ? "text-white" : "text-navy-dark")}>{s.value}</dd>
      </div>
    ))}
  </dl>
);

export default Figures;
