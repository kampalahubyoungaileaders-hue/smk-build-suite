import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { company, whatsappLink } from "@/content/company";
import { cn } from "@/lib/utils";

const siteNav = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = scrolled && !open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Contact bar, hidden once the page scrolls */}
      <div
        className={cn(
          "hidden overflow-hidden border-b border-white/10 bg-navy-dark text-white/80 transition-[height] duration-300 md:block",
          scrolled ? "h-0 border-b-0" : "h-10",
        )}
      >
        <div className="container flex h-10 items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a href={company.phoneHref} className="flex items-center gap-2 tabular hover:text-white">
              <Phone size={14} aria-hidden /> {company.phone}
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 tabular hover:text-white">
              <MessageCircle size={14} aria-hidden /> WhatsApp {company.whatsapp}
            </a>
            <span className="hidden lg:inline">{company.location}</span>
          </div>
          <Link to="/auth" className="hover:text-white">
            Staff login
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "transition-colors duration-300",
          open
            ? "bg-navy-dark"
            : solid
              ? "bg-white shadow-[0_1px_0_hsl(var(--border)),0_8px_24px_-12px_hsl(219_64%_18%/0.25)]"
              : "bg-gradient-to-b from-navy-dark/70 to-transparent",
        )}
      >
        <div className="container flex h-[76px] items-center justify-between gap-6">
          <Link to="/" aria-label={`${company.shortName} home`} className="shrink-0">
            <Logo tone={solid ? "color" : "light"} withName markClassName="h-10 md:h-11" className="[&>span:last-child]:hidden sm:[&>span:last-child]:block" />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {siteNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "relative px-3.5 py-2 text-[15px] font-medium transition-colors",
                    solid ? "text-foreground/75 hover:text-foreground" : "text-white/80 hover:text-white",
                    isActive && (solid ? "text-foreground" : "text-white"),
                    isActive && "after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-[3px] after:bg-smk-red",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild className="hidden h-11 rounded-[2px] bg-smk-red px-5 text-[15px] font-semibold text-white hover:bg-smk-red-dark sm:inline-flex">
              <Link to="/contact">Get a quote</Link>
            </Button>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-[2px] lg:hidden",
                solid ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10",
              )}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div id="site-menu" className="fixed inset-x-0 bottom-0 top-[76px] overflow-y-auto bg-navy-dark bg-blueprint text-white md:top-[116px] lg:hidden">
          <nav aria-label="Mobile" className="container flex flex-col py-6">
            {siteNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn("border-b border-white/10 py-4 text-display text-4xl", isActive ? "text-white" : "text-white/70")
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-8 grid gap-3">
              <Button asChild size="lg" className="h-12 rounded-[2px] bg-smk-red text-base font-semibold hover:bg-smk-red-dark">
                <Link to="/contact">Get a quote</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-[2px] border-white/30 bg-transparent text-base text-white hover:bg-white hover:text-navy-dark">
                <a href={company.phoneHref}>
                  <Phone /> {company.phone}
                </a>
              </Button>
              <Link to="/auth" className="mt-4 text-center text-white/70 hover:text-white">
                Staff login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
