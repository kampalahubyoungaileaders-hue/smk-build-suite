import { CheckCircle2 } from "lucide-react";
import site3 from "@/assets/site-3.png";
import site4 from "@/assets/site-4.png";
import site5 from "@/assets/site-5.png";

const rows = [
  {
    image: site4,
    alt: "Visual timeline management",
    headline: "Visual Timeline Management",
    description:
      "Never miss a deadline. Our Gantt charts give you complete visibility into project schedules, dependencies, and the critical path.",
    benefits: [
      "Drag-and-drop task scheduling",
      "Automatic dependency tracking",
      "Critical path visualization",
      "Milestone tracking",
    ],
    variant: "navy" as const,
    reverse: false,
  },
  {
    image: site5,
    alt: "Complete financial control",
    headline: "Complete Financial Control",
    description:
      "Know exactly where every shilling is going. Track costs by category, manage change orders, and forecast final project costs with confidence.",
    benefits: [
      "Real-time expense tracking",
      "Budget vs. actual analysis",
      "Change order management",
      "Cost forecasting",
    ],
    variant: "red" as const,
    reverse: true,
  },
  {
    image: site3,
    alt: "Unified team communication",
    headline: "Unified Team Communication",
    description:
      "Keep your entire team connected. From site supervisors to finance teams, everyone has instant access to updates, photos, and task assignments.",
    benefits: [
      "Real-time task notifications",
      "Photo documentation system",
      "Instant messaging",
      "Document sharing",
    ],
    variant: "navy" as const,
    reverse: false,
  },
];

const DetailedFeaturesSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
          Why SMK Teams Choose This Platform
        </h2>

        <div className="space-y-24">
          {rows.map((row) => (
            <div
              key={row.headline}
              className={`grid lg:grid-cols-2 gap-12 items-center ${row.reverse ? "lg:flex-row-reverse" : ""}`}
            >
              <div className={row.reverse ? "lg:order-2" : ""}>
                <img
                  src={row.image}
                  alt={row.alt}
                  className="rounded-2xl shadow-xl object-cover w-full h-72 md:h-80"
                />
              </div>
              <div className={row.reverse ? "lg:order-1" : ""}>
                <h3
                  className={`text-2xl md:text-3xl font-bold mb-4 ${
                    row.variant === "navy" ? "text-primary" : "text-accent"
                  }`}
                >
                  {row.headline}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{row.description}</p>
                <ul className="space-y-3">
                  {row.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-3">
                      <CheckCircle2
                        className={`h-5 w-5 flex-shrink-0 ${
                          row.variant === "navy" ? "text-primary" : "text-accent"
                        }`}
                      />
                      <span className="text-foreground font-medium">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DetailedFeaturesSection;
