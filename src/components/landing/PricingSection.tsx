import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started",
    features: [
      "Up to 5 projects",
      "Basic task management",
      "Up to 10 team members",
      "Simple budget tracking",
      "Basic reporting",
    ],
    cta: "Start Free",
    featured: false,
    variant: "navy" as const,
  },
  {
    name: "Professional",
    price: "UGX 250,000",
    period: "/month",
    description: "Best for growing construction companies",
    badge: "Most Popular",
    features: [
      "Unlimited projects",
      "Advanced Gantt charts",
      "Unlimited team members",
      "Complete budget & cost management",
      "Advanced reporting & analytics",
      "Priority support",
    ],
    cta: "Start Free Trial",
    featured: true,
    variant: "red" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale operations",
    features: [
      "Everything in Professional",
      "Custom integrations & API",
      "Dedicated account manager",
      "Custom workflows & reports",
      "Advanced security & SSO",
      "White-label options",
    ],
    cta: "Contact Sales",
    featured: false,
    variant: "navy" as const,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Transparent Pricing for Every Size
          </h2>
          <p className="text-lg text-muted-foreground">
            Scale your success with flexible pricing plans
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border transition-all ${
                plan.featured
                  ? "border-accent shadow-xl scale-[1.03] bg-card"
                  : "border-border bg-card hover:shadow-md"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              <div className="mt-6 mb-6">
                <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.featured ? "text-accent" : "text-primary"}`} />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full rounded-full font-bold ${
                  plan.featured
                    ? "bg-accent text-accent-foreground hover:bg-smk-red-dark"
                    : "bg-primary text-primary-foreground hover:bg-navy-dark"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          30-day money-back guarantee · No questions asked
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
