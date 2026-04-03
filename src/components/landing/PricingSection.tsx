import site2 from "@/assets/site-2.png";
import site4 from "@/assets/site-4.png";
import render1 from "@/assets/render-1.png";
import interior1 from "@/assets/interior-1.png";

const projects = [
  {
    image: render1,
    title: "SMK Heights Residential",
    category: "Residential",
    location: "Kampala, Uganda",
  },
  {
    image: site4,
    title: "Nakasero Office Complex",
    category: "Commercial",
    location: "Nakasero, Kampala",
  },
  {
    image: interior1,
    title: "Interior Fit-Out Works",
    category: "Interior Design",
    location: "Kampala, Uganda",
  },
  {
    image: site2,
    title: "Infrastructure Development",
    category: "Civil Works",
    location: "Western Region",
  },
];

const PricingSection = () => {
  return (
    <section id="projects" className="py-20 md:py-28 bg-surface">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Our Portfolio
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Featured Projects
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((p) => (
            <div key={p.title} className="group overflow-hidden rounded bg-card border border-border">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded">
                  {p.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground mb-1">{p.title}</h3>
                <p className="text-xs text-muted-foreground">{p.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
