import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PageHero from "@/components/site/PageHero";
import SectionHead from "@/components/site/SectionHead";
import { useDocumentTitle } from "@/components/site/useDocumentTitle";
import { services } from "@/content/services";
import { cn } from "@/lib/utils";
import site2 from "@/assets/site-2.webp";

const generalFaqs = [
  { q: "Where do you work?", a: "We are based in Kampala and take on projects across Uganda. Travel for sites outside the Kampala area is agreed in the quote." },
  { q: "How much does a first meeting cost?", a: "Nothing. We visit your site, discuss your plans and then send a written proposal." },
  { q: "How are payments made?", a: "Against milestones set out in the contract, such as completion of the foundation or roof. You only pay for work that is done." },
  { q: "Can you take over a project another contractor started?", a: "Often, yes. We first inspect what has been built and tell you honestly what needs fixing before we continue." },
];

const Services = () => {
  useDocumentTitle("Services");
  return (
    <>
      <PageHero
        title="Services"
        lead="Design, construction, project management, interiors and real estate. Use one service or all of them."
        image={site2}
        imageAlt="SMK crew building foundation walls"
        crumbs={[{ label: "Home", to: "/" }, { label: "Services" }]}
      />

      <section className="bg-white py-20 md:py-28">
        <div className="container space-y-24 md:space-y-32">
          {services.map((s, i) => (
            <article key={s.slug} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
              <Link to={`/services/${s.slug}`} className={cn("group block overflow-hidden rounded-[2px] lg:col-span-6 lg:row-start-1", i % 2 ? "lg:col-start-7" : "lg:col-start-1")} tabIndex={-1} aria-hidden>
                <img src={s.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              </Link>
              <div className={cn("lg:col-span-5 lg:row-start-1", i % 2 ? "lg:col-start-1" : "lg:col-start-8")}>
                <h2 className="text-display text-[44px] text-navy-dark md:text-6xl">{s.title}</h2>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{s.intro[0]}</p>
                <ul className="mt-7 grid gap-x-6 gap-y-2 border-t border-navy/15 pt-6 sm:grid-cols-2">
                  {s.scope.slice(0, 4).map((sc) => (
                    <li key={sc.title} className="flex gap-2.5 text-navy-dark">
                      <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-smk-red" />
                      {sc.title}
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="mt-9 h-12 rounded-[2px] bg-navy-dark px-6 font-semibold hover:bg-navy">
                  <Link to={`/services/${s.slug}`}>More about {s.title.toLowerCase()}</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[hsl(216_30%_95%)] py-24 md:py-32">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHead align="stack" title="Common questions" intro="If your question is not here, call or message us." />
          </div>
          <Accordion type="single" collapsible className="border-t border-navy/15 lg:col-span-7 lg:col-start-6">
            {generalFaqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-navy/15">
                <AccordionTrigger className="py-6 text-left text-xl font-semibold text-navy-dark hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="pb-6 text-lg leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
};

export default Services;
