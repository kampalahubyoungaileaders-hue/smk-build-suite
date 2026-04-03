import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 md:py-28 bg-primary">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          Ready to Transform Your Construction Management?
        </h2>
        <p className="text-lg text-primary-foreground/80 mb-3 max-w-xl mx-auto">
          Join SMK clients who are delivering projects on time and within budget
        </p>
        <p className="text-sm text-primary-foreground/50 italic mb-8">
          "We Deliver Beyond Your Dream"
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Button
            size="lg"
            className="bg-smk-red text-accent-foreground hover:bg-smk-red-dark rounded-full px-8 font-bold h-12 shadow-lg"
          >
            Start Your Free Trial Today <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-full px-8 font-semibold h-12"
          >
            Schedule a Demo
          </Button>
        </div>

        <p className="text-xs text-primary-foreground/50">
          No credit card required · 14-day free trial · Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default CTASection;
