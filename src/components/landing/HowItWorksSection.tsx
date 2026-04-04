const stats = [
  { value: "150+", label: "Projects Done" },
  { value: "50+", label: "Completed Projects" },
  { value: "15+", label: "Expert Engineers" },
  { value: "200+", label: "Workers on Site" },
];

const capabilities = [
  {
    title: "Client Advocacy",
    description: "Putting our clients' interests at the heart of every decision we make.",
  },
  {
    title: "Technical Mastery",
    description: "Leveraging cutting-edge techniques and modern construction methodologies.",
  },
  {
    title: "Cost Efficiency",
    description: "Delivering quality results while maintaining strict budget discipline.",
  },
  {
    title: "Site Safety",
    description: "Maintaining the highest safety standards on every project site.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((s) => (
            <div key={s.label} className="text-center py-6 border-b-2 border-accent">
              <div className="text-3xl md:text-4xl font-extrabold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Why Choose SMK */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Why Choose Us
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Why Choose <span className="text-accent">SMK</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {capabilities.map((c) => (
            <div key={c.title} className="p-6 bg-surface rounded border border-border">
              <h3 className="text-lg font-bold text-foreground mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
