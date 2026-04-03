import {
  CalendarRange,
  BarChart3,
  Users,
  Camera,
  ShieldCheck,
  LineChart,
} from "lucide-react";

const features = [
  {
    icon: CalendarRange,
    title: "Smart Project Planning",
    description: "Set up projects, define phases, create timelines, and assign milestones with intuitive tools.",
    variant: "navy" as const,
  },
  {
    icon: BarChart3,
    title: "Budget Mastery",
    description: "Track costs in real-time, manage change orders, and forecast spending with accuracy.",
    variant: "red" as const,
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Assign tasks, communicate instantly, share documents, and keep everyone aligned.",
    variant: "navy" as const,
  },
  {
    icon: Camera,
    title: "Visual Progress Tracking",
    description: "Document with photos, track KPIs, generate reports, and stay on schedule.",
    variant: "red" as const,
  },
  {
    icon: ShieldCheck,
    title: "Quality & Safety First",
    description: "Log inspections, track incidents, manage compliance, and ensure site safety.",
    variant: "navy" as const,
  },
  {
    icon: LineChart,
    title: "Real-Time Insights",
    description: "Live dashboards, performance analytics, predictive alerts, and data-driven decisions.",
    variant: "red" as const,
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-surface">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything SMK Teams Need to Manage Construction
          </h2>
          <p className="text-lg text-muted-foreground">
            From planning to completion, we've got you covered
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`inline-flex items-center justify-center h-12 w-12 rounded-lg mb-4 ${
                  f.variant === "navy"
                    ? "bg-primary/10 text-primary"
                    : "bg-accent/10 text-accent"
                }`}
              >
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
