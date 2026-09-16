import markColor from "@/assets/smk-mark.png";
import markLight from "@/assets/smk-mark-light.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "color" for light backgrounds, "light" for navy/dark backgrounds */
  tone?: "color" | "light";
  /** Show the company name beside the mark */
  withName?: boolean;
  className?: string;
  markClassName?: string;
}

const Logo = ({ tone = "color", withName = false, className, markClassName }: LogoProps) => (
  <span className={cn("inline-flex items-center gap-3", className)}>
    <img
      src={tone === "light" ? markLight : markColor}
      alt="SMK"
      width={714}
      height={417}
      className={cn("h-10 w-auto shrink-0", markClassName)}
    />
    {withName && (
      <span
        className={cn(
          "font-display leading-[1.05] border-l pl-3",
          tone === "light" ? "text-white border-white/25" : "text-foreground border-border",
        )}
      >
        <span className="block text-[15px] font-semibold tracking-wide">Technical Services &amp;</span>
        <span className="block text-[15px] font-semibold tracking-wide">Real Estates Solutions</span>
      </span>
    )}
  </span>
);

export default Logo;
