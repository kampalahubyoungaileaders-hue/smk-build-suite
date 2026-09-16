import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { company, whatsappLink } from "@/content/company";
import { services } from "@/content/services";
import site5 from "@/assets/site-5.webp";

const StartBand = () => (
  <section className="relative isolate overflow-hidden bg-navy text-white">
    <img src={site5} alt="" loading="lazy" className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-[50%_30%] md:w-[55%] md:[mask-image:linear-gradient(to_right,transparent,black_45%)]" />
    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/95 to-navy/40" />
    <div className="container grid gap-10 py-20 md:py-28 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <h2 className="text-display text-5xl md:text-7xl">Tell us what you want to build.</h2>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">
          We visit the site, listen to your plans and give you honest advice and a written quote. No cost to you for the first meeting.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-[52px] rounded-[2px] bg-smk-red px-7 text-base font-semibold hover:bg-smk-red-dark">
            <Link to="/contact">Request a site visit</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-[52px] rounded-[2px] border-white/40 bg-transparent px-6 text-base font-semibold text-white hover:bg-white hover:text-navy-dark">
            <a href={whatsappLink("Hello SMK, I would like to discuss a project.")} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> Chat on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => {
  const { pathname } = useLocation();
  const showBand = pathname !== "/contact";

  return (
    <footer>
      {showBand && <StartBand />}
      <div className="bg-navy-dark bg-blueprint text-white">
        <div className="h-1.5 bg-smk-red" aria-hidden />
        <div className="container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-4">
            <Logo tone="light" withName markClassName="h-12" />
            <p className="mt-6 max-w-sm leading-relaxed text-white/75">
              Engineering, construction and real estate services from {company.location}. {company.tagline}.
            </p>
            <a href={company.phoneHref} className="text-display tabular mt-8 inline-flex items-center gap-3 text-3xl hover:text-smk-red-light">
              <Phone size={22} aria-hidden /> {company.phone}
            </a>
          </div>

          <nav aria-label="Services" className="lg:col-span-3 lg:col-start-6">
            <h3 className="text-display text-2xl">Services</h3>
            <ul className="mt-5 space-y-3">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`} className="text-white/75 hover:text-white">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className="lg:col-span-2">
            <h3 className="text-display text-2xl">Company</h3>
            <ul className="mt-5 space-y-3">
              {[
                ["About us", "/about"],
                ["Projects", "/projects"],
                ["Contact", "/contact"],
                ["Staff login", "/auth"],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-white/75 hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h3 className="text-display text-2xl">Reach us</h3>
            <ul className="tabular mt-5 space-y-3 whitespace-nowrap text-white/75">
              <li>
                <a href={company.phoneHref} className="hover:text-white">
                  Call {company.phone}
                </a>
              </li>
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp {company.whatsapp}
                </a>
              </li>
              <li>{company.location}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container flex flex-wrap justify-between gap-3 py-6 text-sm text-white/60">
            <p>
              &copy; {new Date().getFullYear()} {company.name}
            </p>
            <p>Registered in Uganda</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
