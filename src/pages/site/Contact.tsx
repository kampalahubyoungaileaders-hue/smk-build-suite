import { useSearchParams } from "react-router-dom";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import EnquiryForm from "@/components/site/EnquiryForm";
import { useDocumentTitle } from "@/components/site/useDocumentTitle";
import { company, whatsappLink } from "@/content/company";
import { getService } from "@/content/services";
import site5 from "@/assets/site-5.webp";

const nextSteps = [
  { title: "We reply", body: "An engineer contacts you, usually the same working day." },
  { title: "We visit the site", body: "We look at the plot and talk through your plans in person." },
  { title: "You get a written quote", body: "Scope, cost and programme, clearly set out for you to review." },
];

const Contact = () => {
  useDocumentTitle("Contact");
  const [params] = useSearchParams();
  const preset = getService(params.get("service") ?? undefined)?.slug ?? "";

  return (
    <>
      <PageHero
        title="Start your project"
        lead="Tell us what you want to build. We will get back to you with clear next steps."
        image={site5}
        imageAlt="SMK engineers on site with a client"
        crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
      />

      <section className="bg-white py-20 md:py-28">
        <div className="container grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-display text-4xl text-navy-dark md:text-5xl">Request a quote</h2>
            <p className="mb-10 mt-3 text-lg text-muted-foreground">It takes about two minutes.</p>
            <EnquiryForm defaultService={preset} />
          </div>

          <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
            <div className="bg-navy-dark bg-blueprint p-8 text-white">
              <h2 className="text-display text-3xl">Talk to us directly</h2>
              <ul className="mt-6 divide-y divide-white/15">
                <li>
                  <a href={company.phoneHref} className="flex items-center gap-4 py-4 hover:text-smk-red-light">
                    <Phone size={22} className="shrink-0 text-smk-red-light" aria-hidden />
                    <span>
                      <span className="block text-sm text-white/70">Call</span>
                      <span className="tabular text-xl font-semibold">{company.phone}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-4 hover:text-smk-red-light">
                    <MessageCircle size={22} className="shrink-0 text-smk-red-light" aria-hidden />
                    <span>
                      <span className="block text-sm text-white/70">WhatsApp</span>
                      <span className="tabular text-xl font-semibold">{company.whatsapp}</span>
                    </span>
                  </a>
                </li>
                <li className="flex items-center gap-4 py-4">
                  <MapPin size={22} className="shrink-0 text-smk-red-light" aria-hidden />
                  <span>
                    <span className="block text-sm text-white/70">Office</span>
                    <span className="text-xl font-semibold">{company.location}</span>
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-display text-3xl text-navy-dark">What happens next</h2>
              <ol className="mt-6 space-y-6">
                {nextSteps.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[40px_1fr] gap-4">
                    <span className="text-display tabular grid h-10 w-10 place-items-center bg-smk-red text-xl text-white">{i + 1}</span>
                    <div>
                      <h3 className="font-semibold text-navy-dark">{s.title}</h3>
                      <p className="mt-1 leading-relaxed text-muted-foreground">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

export default Contact;
