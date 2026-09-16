import { cn } from "@/lib/utils";

interface SectionHeadProps {
  title: string;
  intro?: string;
  tone?: "light" | "dark";
  align?: "split" | "stack";
  action?: React.ReactNode;
  className?: string;
  id?: string;
}

const SectionHead = ({ title, intro, tone = "light", align = "split", action, className, id }: SectionHeadProps) => (
  <div className={cn("grid gap-6", align === "split" && "lg:grid-cols-12 lg:items-end", className)}>
    <h2
      id={id}
      className={cn(
        "text-display text-[44px] md:text-6xl",
        align === "split" && "lg:col-span-6",
        tone === "dark" ? "text-white" : "text-navy-dark",
      )}
    >
      {title}
    </h2>
    {(intro || action) && (
      <div className={cn("flex flex-col items-start gap-5", align === "split" && "lg:col-span-5 lg:col-start-8")}>
        {intro && (
          <p className={cn("max-w-xl text-lg leading-relaxed", tone === "dark" ? "text-white/80" : "text-muted-foreground")}>{intro}</p>
        )}
        {action}
      </div>
    )}
  </div>
);

export default SectionHead;
