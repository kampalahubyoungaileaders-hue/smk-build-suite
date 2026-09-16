import { Link } from "react-router-dom";
import Logo from "@/components/brand/Logo";
import { company, whatsappLink } from "@/content/company";

const links = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const Footer = () => (
  <footer className="bg-navy-dark text-white">
    <div className="h-1 bg-smk-red" aria-hidden />
    <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <Logo tone="light" withName markClassName="h-12" />
        <p className="mt-5 max-w-sm leading-relaxed text-white/75">
          {company.tagline}. Engineering, construction and real estate services from {company.location}.
        </p>
      </div>

      <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-7">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Company</h3>
        <ul className="mt-4 space-y-2.5">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-white/85 transition-colors hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <Link to="/auth" className="text-white/85 transition-colors hover:text-white">
              Staff login
            </Link>
          </li>
        </ul>
      </nav>

      <div className="lg:col-span-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Get in touch</h3>
        <ul className="tabular mt-4 space-y-2.5 text-white/85">
          <li>
            Phone:{" "}
            <a href={company.phoneHref} className="hover:text-white">
              {company.phone}
            </a>
          </li>
          <li>
            WhatsApp:{" "}
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              {company.whatsapp}
            </a>
          </li>
          <li>{company.location}</li>
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="container flex flex-wrap justify-between gap-2 py-6 text-sm text-white/60">
        <p>
          &copy; {new Date().getFullYear()} {company.name}
        </p>
        <p>All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
