import { company, companyStats } from "@/content/company";

const principles = [
  { title: "Client first", body: "Your brief sets the plan. We agree scope, cost and dates in writing before work starts." },
  { title: "Technical rigour", body: "Qualified engineers check every structural stage before it is covered up." },
  { title: "Cost discipline", body: "Every purchase is recorded and approved, so the final account matches the estimate." },
  { title: "Safe sites", body: "Protective gear, briefed crews and tidy sites, every day." },
];

const About = () => (
  <section id="about" className="bg-background py-20 md:py-28">
    <div className="container grid gap-14 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <h2 className="text-[40px] font-semibold leading-[1.05] text-foreground md:text-5xl">Going beyond the brief</h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
          <p>
            {company.name} combines engineering expertise with hands-on construction. From bespoke homes to
            commercial blocks and civil works, we deliver on schedule and within budget.
          </p>
          <p>
            Founded in Kampala in {company.founded}, we have built our reputation on reliable workmanship and honest,
            client-first project management across Uganda.
          </p>
        </div>
      </div>

      <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
        {principles.map((p) => (
          <div key={p.title} className="border-l-[3px] border-smk-red pl-5">
            <dt className="text-2xl font-semibold text-foreground">{p.title}</dt>
            <dd className="mt-2 leading-relaxed text-muted-foreground">{p.body}</dd>
          </div>
        ))}
      </dl>
    </div>

    <div className="container mt-20">
      <dl className="grid grid-cols-2 bg-navy text-white lg:grid-cols-4">
        {companyStats.map((s, i) => (
          <div key={s.label} className={`flex flex-col px-6 py-8 md:px-8 md:py-10 ${i % 2 ? "" : "border-r border-white/15"} ${i < 2 ? "border-b border-white/15 lg:border-b-0" : ""} lg:border-r lg:last:border-r-0`}>
            <dt className="order-2 mt-1 text-[15px] text-white/80">{s.label}</dt>
            <dd className="tabular font-display text-5xl font-semibold leading-none md:text-6xl">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);

export default About;
