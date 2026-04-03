import { Star } from "lucide-react";

const testimonials = [
  {
    name: "David Mukozi",
    title: "Project Manager",
    company: "Small Contractors Ltd",
    quote:
      "This platform saved us countless hours. We've gone from juggling spreadsheets to having real-time visibility into all our projects.",
  },
  {
    name: "Jane Nalweyiso",
    title: "Finance Manager",
    company: "Construction Group Uganda",
    quote:
      "The budget tracking is fantastic. We now catch overspends immediately and can manage change orders efficiently.",
  },
  {
    name: "Eng. Patrick Omondi",
    title: "Site Supervisor",
    company: "Premier Builders",
    quote:
      "Communication with the team is instant. Photo uploads, task updates, and notifications keep everyone on the same page.",
  },
  {
    name: "Robert Kibuule",
    title: "Project Director",
    company: "National Construction Services",
    quote:
      "We've reduced project management overhead by 40%. The automated reporting saves us days of work each month.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Construction Leaders
          </h2>
          <p className="text-lg text-muted-foreground">
            See how SMK clients are managing projects better
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.title}, {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
