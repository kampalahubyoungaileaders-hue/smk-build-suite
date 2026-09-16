import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={cn("sticky top-0 z-50 bg-white transition-shadow", scrolled && "shadow-[0_1px_0_hsl(var(--border))]")}>
      <div className="container flex h-[72px] items-center justify-between gap-6">
        <a href="#top" className="shrink-0" aria-label="SMK Technical Services home">
          <Logo withName markClassName="h-11" className="[&>span:last-child]:hidden sm:[&>span:last-child]:block" />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] font-medium text-foreground/80 transition-colors hover:text-primary">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link to="/auth" className="text-[15px] font-medium text-muted-foreground hover:text-primary">
            Staff login
          </Link>
          <Button asChild className="h-11 rounded-sm bg-smk-red px-6 text-[15px] font-semibold text-white hover:bg-smk-red-dark">
            <a href="#contact">Request a quote</a>
          </Button>
        </div>

        <button
          className="-mr-2 rounded p-2 text-foreground lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-[72px] z-50 overflow-y-auto border-t bg-white lg:hidden">
          <nav className="container flex flex-col py-4" aria-label="Mobile">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b py-4 font-display text-2xl font-semibold text-foreground"
              >
                {l.label}
              </a>
            ))}
            <Button asChild className="mt-6 h-12 rounded-sm bg-smk-red text-base font-semibold text-white hover:bg-smk-red-dark">
              <a href="#contact" onClick={() => setOpen(false)}>Request a quote</a>
            </Button>
            <Link to="/auth" className="mt-4 py-2 text-center font-medium text-muted-foreground">
              Staff login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
