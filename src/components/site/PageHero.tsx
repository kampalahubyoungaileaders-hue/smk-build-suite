import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  lead?: string;
  image?: string;
  imageAlt?: string;
  crumbs?: { label: string; to?: string }[];
  children?: React.ReactNode;
  className?: string;
}

/** Dark page opener used by every inner page: title on the drafting grid, photo to the right. */
const PageHero = ({ title, lead, image, imageAlt = "", crumbs, children, className }: PageHeroProps) => (
  <section className={cn("relative isolate overflow-hidden bg-navy-dark text-white", className)}>
    {image && (
      <div className="absolute inset-y-0 right-0 -z-10 w-full md:w-[62%] md:[mask-image:linear-gradient(to_right,transparent,black_35%)]">
        <img src={image} alt={imageAlt} className="h-full w-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/80 to-navy-dark/20 md:via-navy-dark/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 to-transparent md:hidden" />
      </div>
    )}
    <div className="absolute inset-0 -z-20 bg-blueprint" aria-hidden />

    <div className="container pb-16 pt-36 md:pb-24 md:pt-48">
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
            {crumbs.map((c, i) => (
              <li key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={14} aria-hidden />}
                {c.to ? (
                  <Link to={c.to} className="hover:text-white">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-white">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="max-w-3xl">
        <h1 className="text-display text-[52px] sm:text-7xl lg:text-[88px]">{title}</h1>
        {lead && <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">{lead}</p>}
        {children}
      </div>
    </div>
    <div className="h-1.5 bg-smk-red" aria-hidden />
  </section>
);

export default PageHero;
