import { HardHat, ClipboardCheck, Ruler, ShieldCheck } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import Figures from "@/components/site/Figures";
import SectionHead from "@/components/site/SectionHead";
import Process from "@/components/site/Process";
import { useDocumentTitle } from "@/components/site/useDocumentTitle";
import { company } from "@/content/company";
import site3 from "@/assets/site-3.webp";
import site1 from "@/assets/site-1.webp";
import site2 from "@/assets/site-2.webp";

const teams = [
  { icon: Ruler, title: "Engineers and designers", body: "Architectural and structural design, bills of quantities and stage inspections." },
  { icon: ClipboardCheck, title: "Project managers", body: "Programmes, procurement, budgets and the reports our clients rely on." },
  { icon: HardHat, title: "Site supervisors and crews", body: "Masons, steel fixers, carpenters and finishers, led by experienced supervisors." },
];

const commitments = [
  "Reinforcement is inspected and recorded before every concrete pour.",
  "Every worker on site wears protective equipment.",
  "Materials are checked against the specification when they arrive.",
  "Variations to cost or scope are agreed in writing before work continues.",
  "Sites are secured and cleaned at the end of each day.",
];

const About = () => {
  useDocumentTitle("About us");
  return (
    <>
      <PageHero
        title="Engineers who build what they design"
        lead={`${company.name} brings design, construction and project management together, so clients deal with one team from start to finish.`}
        image={site3}
        imageAlt="A two-storey block under construction with scaffolding"
        crumbs={[{ label: "Home", to: "/" }, { label: "About us" }]}
      />

      <section className="bg-white py-24 md:py-32">
        <div className="container grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-display text-[44px] text-navy-dark md:text-6xl">Our story</h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7">
            <p className="text-2xl leading-snug text-navy-dark">
              SMK was founded in Kampala in {company.founded} with a simple idea: building should be planned properly, priced honestly and finished on time.
            </p>
            <p>
              Too many projects in Uganda stall halfway because costs were guessed, materials went missing or nobody was accountable for the programme. We set up SMK to do the opposite.
            </p>
            <p>
              Today our engineers, project managers and site crews work on homes, apartments, commercial buildings, interiors and civil works. Every project runs through the same system for tasks, budgets and approvals, so our clients always know where their build stands.
            </p>
          </div>
        </div>
        <div className="container mt-20">
          <Figures />
        </div>
      </section>

      <section className="bg-[hsl(216_30%_95%)] py-24 md:py-32">
        <div className="container">
          <SectionHead title="The people on your project" intro="Every SMK project is staffed by three teams working from one plan." />
          <ul className="mt-14 grid gap-px overflow-hidden rounded-[2px] bg-navy/15 md:grid-cols-3">
            {teams.map((t) => (
              <li key={t.title} className="bg-white p-8 md:p-10">
                <t.icon size={32} strokeWidth={1.5} className="text-smk-red" aria-hidden />
                <h3 className="text-display mt-6 text-3xl text-navy-dark">{t.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{t.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-24 md:py-32">
        <div className="container grid items-center gap-14 lg:grid-cols-12">
          <div className="grid grid-cols-2 gap-4 lg:col-span-6">
            <img src={site1} alt="Engineers inspecting slab reinforcement" loading="lazy" className="aspect-[3/4] w-full rounded-[2px] object-cover" />
            <img src={site2} alt="Crew building foundation walls" loading="lazy" className="mt-12 aspect-[3/4] w-full rounded-[2px] object-cover" />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <ShieldCheck size={36} strokeWidth={1.5} className="text-smk-red" aria-hidden />
            <h2 className="text-display mt-5 text-[44px] text-navy-dark md:text-6xl">Quality and safety, every day</h2>
            <ul className="mt-8 divide-y divide-navy/15 border-y border-navy/15">
              {commitments.map((c) => (
                <li key={c} className="py-4 text-lg leading-relaxed text-navy-dark">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-navy-dark py-24 text-white md:py-32">
        <div className="absolute inset-0 -z-10 bg-blueprint" aria-hidden />
        <div className="container">
          <SectionHead tone="dark" title="How we work with you" intro="The same five stages on every project, large or small." />
          <Process className="mt-16" />
        </div>
      </section>
    </>
  );
};

export default About;
