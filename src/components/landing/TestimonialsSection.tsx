const testimonials = [
  {
    name: "David Mukozi",
    title: "Project Manager",
    company: "Small Contractors Ltd",
    quote:
      "SMK delivered our residential project ahead of schedule with outstanding quality. Their attention to detail and professionalism is unmatched.",
  },
  {
    name: "Jane Nalweyiso",
    title: "Finance Manager",
    company: "Construction Group Uganda",
    quote:
      "Working with SMK gave us complete confidence in budget management. Every shilling was accounted for, and the final result exceeded our expectations.",
  },
  {
    name: "Eng. Patrick Omondi",
    title: "Site Supervisor",
    company: "Premier Builders",
    quote:
      "The coordination and communication from SMK's team is exceptional. They keep everyone aligned and projects run smoothly from start to finish.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            What Our Clients Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-surface rounded border border-border p-6"
            >
              <div className="w-10 h-1 bg-accent mb-4" />
              <p className="text-foreground mb-6 leading-relaxed text-sm">"{t.quote}"</p>
              <div>
                <div className="font-semibold text-foreground text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">
                  {t.title}, {t.company}
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
