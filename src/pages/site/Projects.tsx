import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import { useDocumentTitle } from "@/components/site/useDocumentTitle";
import { projects, sectors, type Sector } from "@/content/projects";
import { cn } from "@/lib/utils";
import site4 from "@/assets/site-4.webp";

const ProjectsPage = () => {
  useDocumentTitle("Projects");
  const [sector, setSector] = useState<Sector | "All">("All");
  const shown = sector === "All" ? projects : projects.filter((p) => p.sector === sector);

  return (
    <>
      <PageHero
        title="Projects"
        lead="A selection of the homes, buildings, interiors and civil works we have designed, built and managed."
        image={site4}
        imageAlt="Workers laying a suspended slab beside a tiled roof"
        crumbs={[{ label: "Home", to: "/" }, { label: "Projects" }]}
      />

      <section className="bg-white py-16 md:py-24">
        <div className="container">
          <div role="group" aria-label="Filter by sector" className="flex flex-wrap gap-2">
            {(["All", ...sectors] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={sector === s}
                onClick={() => setSector(s)}
                className={cn(
                  "h-11 rounded-[2px] border px-5 text-[15px] font-medium transition-colors",
                  sector === s ? "border-navy-dark bg-navy-dark text-white" : "border-navy/20 text-navy-dark hover:border-navy-dark",
                )}
              >
                {s === "All" ? "All projects" : s}
              </button>
            ))}
          </div>

          <ul className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
            {shown.map((p, i) => (
              <li key={p.slug} className={cn(i === 0 && shown.length > 2 && "md:col-span-2")}>
                <Link to={`/projects/${p.slug}`} className="group block">
                  <div className="overflow-hidden rounded-[2px] bg-muted">
                    <img
                      src={p.cover.src}
                      alt={p.cover.alt}
                      loading={i === 0 ? "eager" : "lazy"}
                      className={cn(
                        "w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]",
                        i === 0 && shown.length > 2 ? "aspect-[4/3] md:aspect-[21/9]" : "aspect-[4/3]",
                      )}
                    />
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-6">
                    <div>
                      <p className="text-[15px] text-muted-foreground">
                        <span className="font-medium text-smk-red">{p.sector}</span>, {p.location}
                      </p>
                      <h2 className="text-display mt-1 text-4xl text-navy-dark">{p.title}</h2>
                      <p className="mt-2 max-w-lg leading-relaxed text-muted-foreground">{p.summary}</p>
                    </div>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-navy/20 text-navy transition-colors group-hover:border-smk-red group-hover:bg-smk-red group-hover:text-white">
                      <ArrowUpRight size={20} aria-hidden />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default ProjectsPage;
