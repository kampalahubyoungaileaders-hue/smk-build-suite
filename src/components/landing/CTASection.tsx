import { Button } from "@/components/ui/button";
import site5 from "@/assets/site-5.png";

const CTASection = () => {
  return (
    <section id="contact" className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0">
        <img src={site5} alt="Construction" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/85" />
      </div>

      <div className="container relative z-10 text-center">
        <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">
          Get In Touch
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 max-w-xl mx-auto">
          Our approach is always to begin with the customer's needs in mind. We are a solutions centred company.
        </h2>
        <p className="text-primary-foreground/60 text-sm italic mb-8">
          "We Deliver Beyond Your Dream"
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-smk-red-dark rounded px-8 font-bold h-12"
          >
            Contact Us
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded px-8 font-semibold h-12"
          >
            Let's Talk
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mt-10 text-primary-foreground/70 text-sm">
          <span>WhatsApp: +256 752 981 600</span>
          <span>Phone: +256 705 070 635</span>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
