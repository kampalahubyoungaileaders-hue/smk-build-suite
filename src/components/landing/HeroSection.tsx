import { Button } from "@/components/ui/button";
import site1 from "@/assets/site-1.png";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={site1} alt="Construction site" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/75" />
      </div>

      {/* Accent bar */}
      <div className="absolute top-0 left-0 w-2 h-full bg-accent" />

      <div className="container relative z-10 py-20 md:py-28">
        <div className="max-w-2xl space-y-6">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider">
            SMK Technical Services & Real Estates Solutions
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight">
            Delivering The Infrastructure of{" "}
            <span className="text-accent">Change.</span>
          </h1>

          <p className="text-primary-foreground/80 text-lg max-w-lg leading-relaxed">
            We deliver beyond your dream — professional construction, project management, and real estate solutions built on trust, quality, and precision.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-smk-red-dark rounded px-8 font-bold h-12"
            >
              Our Services
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded px-8 font-semibold h-12"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
