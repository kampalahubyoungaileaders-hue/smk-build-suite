import { MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { company, whatsappLink } from "@/content/company";

const Contact = () => (
  <section id="contact" className="bg-navy text-white">
    <div className="container grid gap-12 py-20 md:py-24 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <h2 className="text-[40px] font-semibold leading-[1.05] md:text-5xl">Planning a build? Let&rsquo;s talk it through.</h2>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">
          Tell us what you want to build, where, and roughly when. We will visit the site, give you honest advice and a
          written quote.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 rounded-sm bg-smk-red px-7 text-base font-semibold text-white hover:bg-smk-red-light">
            <a href={whatsappLink("Hello SMK, I would like a quote for a project.")} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> Message us on WhatsApp
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-sm border-white/40 bg-transparent px-6 text-base font-semibold text-white hover:bg-white hover:text-navy-dark"
          >
            <a href={company.phoneHref}>
              <Phone /> Call us
            </a>
          </Button>
        </div>
      </div>

      <dl className="grid content-start gap-px self-center overflow-hidden rounded-sm bg-white/15 lg:col-span-5 lg:col-start-8">
        {[
          { icon: Phone, label: "Phone", value: company.phone, href: company.phoneHref },
          { icon: MessageCircle, label: "WhatsApp", value: company.whatsapp, href: whatsappLink() },
          { icon: MapPin, label: "Office", value: company.location },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-4 bg-navy px-6 py-5">
            <row.icon size={22} className="shrink-0 text-smk-red-light" aria-hidden />
            <div className="min-w-0">
              <dt className="text-sm text-white/70">{row.label}</dt>
              <dd className="tabular text-xl font-semibold">
                {row.href ? (
                  <a
                    href={row.href}
                    className="underline-offset-4 hover:underline"
                    {...(row.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  </section>
);

export default Contact;
