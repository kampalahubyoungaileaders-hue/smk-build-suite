import { Compass, HardHat, ClipboardList, Sofa } from "lucide-react";

const services = [
  {
    icon: Compass,
    title: "Engineering and design",
    body: "Architectural drawings, structural design and bills of quantities, prepared to pass approval the first time.",
  },
  {
    icon: HardHat,
    title: "Construction",
    body: "Foundations to finishes for residential, commercial and civil works, with trained crews and daily site supervision.",
  },
  {
    icon: ClipboardList,
    title: "Project management",
    body: "One accountable team for schedule, procurement and cost. You get clear progress and spend reports at every stage.",
  },
  {
    icon: Sofa,
    title: "Interiors and real estate",
    body: "Fit-out, joinery and finishing, plus support finding, developing and managing property.",
  },
];

const Services = () => (
  <section id="services" className="bg-white py-20 md:py-28">
    <div className="container">
      <div className="grid gap-6 lg:grid-cols-12">
        <h2 className="text-[40px] font-semibold leading-[1.05] text-foreground md:text-5xl lg:col-span-5">
          What we do
        </h2>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7 lg:pt-2">
          From the first drawing to the last coat of paint, SMK handles the whole build so you deal with one team, one
          plan and one budget.
        </p>
      </div>

      <div className="mt-14 grid border-t sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <div key={s.title} className="border-b py-8 sm:odd:border-r sm:odd:pr-6 sm:even:pl-6 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
            <s.icon size={28} strokeWidth={1.75} className="text-smk-red" aria-hidden />
            <h3 className="mt-5 text-2xl font-semibold leading-tight text-foreground">{s.title}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Services;
