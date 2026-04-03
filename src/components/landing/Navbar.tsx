import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import smkLogo from "@/assets/smk-logo.jpeg";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About SMK", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border shadow-sm">
      <div className="container flex h-16 items-center justify-between md:h-18">
        <a href="#home" className="flex items-center gap-2">
          <img src={smkLogo} alt="SMK Technical Services" className="h-10 w-auto" />
        </a>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" className="text-primary font-semibold">
            Login
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-smk-red-dark font-semibold rounded-full px-6">
            Sign Up
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-foreground/80 hover:text-primary py-2"
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-3 border-t border-border">
              <Button variant="ghost" className="text-primary font-semibold flex-1">
                Login
              </Button>
              <Button className="bg-accent text-accent-foreground hover:bg-smk-red-dark font-semibold rounded-full flex-1">
                Sign Up
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
