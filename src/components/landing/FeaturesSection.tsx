import site3 from "@/assets/site-3.png";
import site4 from "@/assets/site-4.png";
import render1 from "@/assets/render-1.png";

const services = [
  {
    image: render1,
    title: "Engineering",
    description:
      "Full-scale structural, civil, and MEP engineering services for residential, commercial, and industrial projects.",
    number: "01",
  },
  {
    image: site4,
    title: "Projects",
    description:
      "End-to-end project management from planning through completion — on time and within budget.",
    number: "02",
  },
  {
    image: site3,
    title: "Construction",
    description:
      "Quality construction delivery with skilled teams, modern equipment, and strict safety standards.",
    number: "03",
  },
];

const FeaturesSection = () => {
  return (
    <section id="services" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            What We Do
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Our Core Services
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s) => (
            <div key={s.title} className="group relative overflow-hidden">
              <div className="relative h-72 overflow-hidden">
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <span className="absolute bottom-4 left-4 text-5xl font-extrabold text-primary-foreground/20">
                  {s.number}
                </span>
              </div>
              <div className="pt-5">
                <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
