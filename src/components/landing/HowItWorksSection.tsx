import { FolderPlus, ArrowUpRight, Eye, Flag } from "lucide-react";

const steps = [
  {
    icon: FolderPlus,
    title: "Create & Plan",
    description: "Set up project details, budget, timeline, and team assignments",
    variant: "navy" as const,
  },
  {
    icon: ArrowUpRight,
    title: "Execute & Track",
    description: "Update task progress, log costs, document with photos, manage resources",
    variant: "red" as const,
  },
  {
    icon: Eye,
    title: "Monitor & Report",
    description: "Track KPIs, generate reports, monitor budget vs. actual, make adjustments",
    variant: "navy" as const,
  },
  {
    icon: Flag,
    title: "Complete & Archive",
    description: "Close out projects, archive documents, capture lessons learned",
    variant: "red" as const,
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-surface">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get Your SMK Projects Under Control in 4 Steps
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-border" />
              )}
              <div
                className={`inline-flex items-center justify-center h-20 w-20 rounded-2xl mb-6 shadow-md ${
                  step.variant === "navy"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                <step.icon className="h-8 w-8" />
              </div>
              <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                Step {i + 1}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
