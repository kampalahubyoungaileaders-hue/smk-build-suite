import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowUpRight, Check, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PageHero from "@/components/site/PageHero";
import { useDocumentTitle } from "@/components/site/useDocumentTitle";
import { getService, services } from "@/content/services";
import { projects } from "@/content/projects";
import { company, whatsappLink } from "@/content/company";

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = getService(slug);
  useDocumentTitle(service?.title);
  if (!service) return <Navigate to="/services" replace />;

  const related = projects.filter((p) => p.services.includes(service.slug));
  const others = services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <PageHero
        title={service.title}
        lead={service.summary}
        image={service.image}
        imageAlt={service.imageAlt}
        crumbs={[{ label: "Home", to: "/" }, { label: "Services", to: "/services" }, { label: service.title }]}
      />

      <section className="bg-white py-20 md:py-28">
        <div className="container grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
              {service.intro.map((p, i) => (
                <p key={i} className={i === 0 ? "text-2xl leading-snug text-navy-dark" : undefined}>
                  {p}
                </p>
              ))}
            </div>

            <h2 className="text-display mt-16 text-4xl text-navy-dark md:text-5xl">What is included</h2>
            <dl className="mt-8 border-t border-navy/15">
              {service.scope.map((s) => (
                <div key={s.title} className="grid gap-2 border-b border-navy/15 py-6 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-8">
                  <dt className="text-display text-2xl text-navy-dark">{s.title}</dt>
                  <dd className="leading-relaxed text-muted-foreground">{s.body}</dd>
                </div>
              ))}
            </dl>

            <h2 className="text-display mt-16 text-4xl text-navy-dark md:text-5xl">What you receive</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {service.deliverables.map((d) => (
                <li key={d} className="flex gap-3 bg-[hsl(216_30%_95%)] px-5 py-4 text-navy-dark">
                  <Check size={20} className="mt-0.5 shrink-0 text-smk-red" aria-hidden />
                  {d}
                </li>
              ))}
            </ul>

            {service.faqs.length > 0 && (
              <>
                <h2 className="text-display mt-16 text-4xl text-navy-dark md:text-5xl">Questions</h2>
                <Accordion type="single" collapsible className="mt-6 border-t border-navy/15">
                  {service.faqs.map((f) => (
                    <AccordionItem key={f.q} value={f.q} className="border-navy/15">
                      <AccordionTrigger className="py-5 text-left text-lg font-semibold text-navy-dark hover:no-underline">{f.q}</AccordionTrigger>
                      <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </>
            )}
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="sticky top-28 space-y-6">
              <div className="bg-navy-dark bg-blueprint p-8 text-white">
                <h2 className="text-display text-3xl">Discuss your project</h2>
                <p className="mt-3 leading-relaxed text-white/80">Tell us about your site and plans. An engineer will get back to you.</p>
                <div className="mt-6 grid gap-3">
                  <Button asChild className="h-12 rounded-[2px] bg-smk-red font-semibold hover:bg-smk-red-dark">
                    <Link to={`/contact?service=${service.slug}`}>Request a quote</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-12 rounded-[2px] border-white/30 bg-transparent font-semibold text-white hover:bg-white hover:text-navy-dark">
                    <a href={whatsappLink(`Hello SMK, I'm interested in ${service.title.toLowerCase()}.`)} target="_blank" rel="noopener noreferrer">
                      <MessageCircle /> WhatsApp
                    </a>
                  </Button>
                  <a href={company.phoneHref} className="tabular mt-2 flex items-center justify-center gap-2 text-white/80 hover:text-white">
                    <Phone size={16} aria-hidden /> {company.phone}
                  </a>
                </div>
              </div>
              <nav aria-label="Other services" className="border border-navy/15 p-6">
                <h2 className="font-semibold text-navy-dark">Other services</h2>
                <ul className="mt-3">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <Link to={`/services/${o.slug}`} className="flex items-center justify-between border-b border-navy/10 py-3 text-muted-foreground last:border-0 hover:text-navy-dark">
                        {o.title} <ArrowUpRight size={16} aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-[hsl(216_30%_95%)] py-20 md:py-28">
          <div className="container">
            <h2 className="text-display text-4xl text-navy-dark md:text-5xl">Related projects</h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link to={`/projects/${p.slug}`} className="group block">
                    <div className="overflow-hidden rounded-[2px]">
                      <img src={p.cover.src} alt={p.cover.alt} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">{p.sector}</p>
                    <h3 className="text-display text-3xl text-navy-dark group-hover:text-smk-red">{p.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
};

export default ServiceDetail;
