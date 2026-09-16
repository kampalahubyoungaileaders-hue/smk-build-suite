import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroDrawing from "@/components/site/HeroDrawing";
import Figures from "@/components/site/Figures";
import SectionHead from "@/components/site/SectionHead";
import Process from "@/components/site/Process";
import Testimonials from "@/components/site/Testimonials";
import { useDocumentTitle } from "@/components/site/useDocumentTitle";
import { company } from "@/content/company";
import { services } from "@/content/services";
import { projects } from "@/content/projects";
import { cn } from "@/lib/utils";
import site5 from "@/assets/site-5.webp";
import site3 from "@/assets/site-3.webp";

const principles = [
  { title: "Engineers on every site", body: "Each structural stage is checked by a qualified engineer before it is covered up." },
  { title: "Costs you can follow", body: "Every purchase is recorded and approved, so the final account matches the estimate." },
  { title: "Dates we keep", body: "A written programme from day one, with early warning if anything threatens it." },
  { title: "Safe, tidy sites", body: "Protective gear for every worker, secure storage and respect for the neighbours." },
];

const Hero = () => (
  <section className="relative isolate overflow-hidden bg-navy-dark text-white">
    <div className="absolute inset-0 -z-10 bg-blueprint" aria-hidden />
    <div
      aria-hidden
      className="absolute -right-40 top-0 -z-10 h-full w-[70%] bg-[radial-gradient(closest-side,hsl(217_57%_35%/0.55),transparent)]"
    />
    <div className="container grid items-center gap-14 pb-20 pt-36 md:pt-44 lg:min-h-[min(100svh,960px)] lg:grid-cols-12 lg:gap-8 lg:pb-24">
      <div className="lg:col-span-6">
        <p className="text-[17px] text-white/80">Engineering and construction in Uganda since {company.founded}</p>
        <h1 className="text-display mt-5 text-[64px] sm:text-[88px] xl:text-[112px]">
          From the first drawing to the day you move in.
        </h1>
        <p className="mt-7 max-w-lg text-lg leading-relaxed text-white/85 md:text-xl">
          SMK designs, builds and manages homes, commercial buildings and civil works, with engineers on site and costs you can follow.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-14 rounded-[2px] bg-smk-red px-8 text-base font-semibold hover:bg-smk-red-dark">
            <Link to="/contact">Request a site visit</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 rounded-[2px] border-white/40 bg-transparent px-6 text-base font-semibold text-white hover:bg-white hover:text-navy-dark">
            <a href={company.phoneHref}>
              <Phone /> {company.phone}
            </a>
          </Button>
        </div>
      </div>
      <div className="lg:col-span-6">
        <HeroDrawing />
      </div>
    </div>
    <div className="h-1.5 bg-smk-red" aria-hidden />
  </section>
);

const ServicesIndex = () => {
  const [active, setActive] = useState(0);
  return (
    <section aria-labelledby="services-title" className="bg-white py-24 md:py-32">
      <div className="container">
        <SectionHead
          id="services-title"
          title="Everything a building needs, under one roof"
          intro="Work with one team from design to handover, or bring us in for the stage you need."
          action={
            <Link to="/services" className="font-semibold text-navy underline decoration-smk-red decoration-2 underline-offset-[6px] hover:text-smk-red">
              All services
            </Link>
          }
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <div className="relative hidden lg:col-span-5 lg:block">
            <div className="sticky top-28 aspect-[4/5] overflow-hidden rounded-[2px] bg-muted">
              {services.map((s, i) => (
                <img
                  key={s.slug}
                  src={s.image}
                  alt={i === active ? s.imageAlt : ""}
                  aria-hidden={i !== active}
                  loading="lazy"
                  className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", i === active ? "opacity-100" : "opacity-0")}
                />
              ))}
            </div>
          </div>

          <ul className="border-t border-navy/15 lg:col-span-7">
            {services.map((s, i) => (
              <li key={s.slug} className="border-b border-navy/15">
                <Link
                  to={`/services/${s.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group grid grid-cols-[88px_1fr_auto] items-center gap-5 py-7 sm:grid-cols-[1fr_auto] md:py-9"
                >
                  <img src={s.image} alt="" loading="lazy" className="aspect-square w-[88px] rounded-[2px] object-cover sm:hidden" />
                  <div>
                    <h3 className={cn("text-display text-4xl transition-colors md:text-5xl", i === active ? "text-navy-dark" : "text-navy-dark/80 lg:text-navy-dark/55")}>
                      {s.title}
                    </h3>
                    <p className="mt-2 max-w-lg leading-relaxed text-muted-foreground">{s.summary}</p>
                  </div>
                  <span
                    className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-colors",
                      i === active ? "border-smk-red bg-smk-red text-white" : "border-navy/20 text-navy",
                    )}
                  >
                    <ArrowUpRight size={20} aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

const WhySMK = () => (
  <section aria-labelledby="why-title" className="bg-[hsl(216_30%_95%)] py-24 md:py-32">
    <div className="container grid items-center gap-14 lg:grid-cols-12">
      <div className="relative lg:col-span-5">
        <img src={site5} alt="SMK engineers setting out a new site with the client" loading="lazy" className="aspect-[4/5] w-full rounded-[2px] object-cover" />
        <div className="absolute -bottom-8 right-4 max-w-[260px] bg-navy-dark p-6 text-white sm:-right-8">
          <p className="text-display text-5xl">{company.founded}</p>
          <p className="mt-2 leading-snug text-white/80">Founded in Kampala. Building across Uganda.</p>
        </div>
      </div>
      <div className="pt-6 lg:col-span-6 lg:col-start-7 lg:pt-0">
        <h2 id="why-title" className="text-display text-[44px] text-navy-dark md:text-6xl">
          Building is a big commitment. We treat it that way.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Most of our clients are building once, with money they have worked hard for. That is why we plan carefully, report honestly and finish what we start.
        </p>
        <dl className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {principles.map((p) => (
            <div key={p.title} className="border-t-[3px] border-navy-dark pt-5">
              <dt className="text-display text-[28px] text-navy-dark">{p.title}</dt>
              <dd className="mt-2 leading-relaxed text-muted-foreground">{p.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
);

const HowWeWork = () => (
  <section aria-labelledby="process-title" className="relative isolate overflow-hidden bg-navy-dark py-24 text-white md:py-32">
    <div className="absolute inset-0 -z-10 bg-blueprint" aria-hidden />
    <div className="container">
      <SectionHead
        id="process-title"
        tone="dark"
        title="How your project runs"
        intro="Five clear stages. You approve each one before we move to the next."
      />
      <Process className="mt-16" />
    </div>
  </section>
);

const FeaturedProjects = () => {
  const [lead, ...rest] = projects;
  return (
    <section aria-labelledby="projects-title" className="bg-white py-24 md:py-32">
      <div className="container">
        <SectionHead
          id="projects-title"
          title="Recent work"
          intro="Homes, offices, interiors and civil works across Uganda."
          action={
            <Button asChild variant="outline" className="h-12 rounded-[2px] border-navy/30 px-5 font-semibold text-navy-dark hover:bg-navy-dark hover:text-white">
              <Link to="/projects">See all projects</Link>
            </Button>
          }
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:grid-rows-3">
          <ProjectTile project={lead} className="lg:col-span-7 lg:row-span-3" large />
          {rest.slice(0, 3).map((p) => (
            <ProjectTile key={p.slug} project={p} className="lg:col-span-5" />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProjectTile = ({ project: p, className, large }: { project: (typeof projects)[number]; className?: string; large?: boolean }) => (
  <Link
    to={`/projects/${p.slug}`}
    className={cn("group relative isolate flex min-h-[260px] items-end overflow-hidden rounded-[2px] bg-navy-dark text-white", large && "min-h-[420px] lg:min-h-0", className)}
  >
    <img src={p.cover.src} alt={p.cover.alt} loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-dark/95 via-navy-dark/30 to-transparent" />
    <div className="flex w-full items-end justify-between gap-4 p-6 md:p-8">
      <div>
        <p className="text-sm font-medium text-white/80">
          {p.sector}, {p.location}
        </p>
        <h3 className={cn("text-display mt-1", large ? "text-4xl md:text-5xl" : "text-3xl")}>{p.title}</h3>
      </div>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur transition-colors group-hover:bg-smk-red">
        <ArrowUpRight size={20} aria-hidden />
      </span>
    </div>
  </Link>
);

const FromAbroad = () => (
  <section aria-labelledby="abroad-title" className="bg-[hsl(216_30%_95%)]">
    <div className="grid lg:grid-cols-2">
      <img src={site3} alt="Two-storey block walls rising behind scaffolding" loading="lazy" className="h-72 w-full object-cover sm:h-96 lg:h-full" />
      <div className="px-6 py-20 sm:px-12 md:py-28 lg:px-16 xl:px-24">
        <h2 id="abroad-title" className="text-display text-[44px] text-navy-dark md:text-6xl">
          Building at home while you live abroad?
        </h2>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
          Many of our clients follow their build from outside Uganda. You stay in control without having to be on site.
        </p>
        <ul className="mt-9 space-y-4">
          {[
            "Photo and video updates at every stage",
            "A clear cost report against your budget",
            "Payments released against agreed milestones",
            "One engineer as your point of contact",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-lg text-navy-dark">
              <Check className="mt-1 shrink-0 text-smk-red" size={20} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <Button asChild size="lg" className="mt-10 h-[52px] rounded-[2px] bg-navy-dark px-7 text-base font-semibold hover:bg-navy">
          <Link to="/services/project-management">How project management works</Link>
        </Button>
      </div>
    </div>
  </section>
);

const Home = () => {
  useDocumentTitle();
  return (
    <>
      <Hero />
      <section aria-label="SMK in figures" className="border-b bg-white py-16 md:py-20">
        <div className="container">
          <Figures />
        </div>
      </section>
      <ServicesIndex />
      <WhySMK />
      <HowWeWork />
      <FeaturedProjects />
      <FromAbroad />
      <Testimonials />
    </>
  );
};

export default Home;
