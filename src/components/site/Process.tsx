import { cn } from "@/lib/utils";

const steps = [
  { title: "Site visit", body: "We meet you on the plot, look at the ground and access, and listen to what you want." },
  { title: "Design and estimate", body: "Drawings and a bill of quantities, so you know the cost before you commit." },
  { title: "Approvals", body: "We prepare and follow up the submissions for building permission." },
  { title: "Construction", body: "Our crews build, with engineers inspecting each stage and regular updates to you." },
  { title: "Handover", body: "A final inspection together, the keys, and a record of what was built." },
];

/** How a project runs, from first visit to handover. */
const Process = ({ className }: { className?: string }) => (
  <ol className={cn("relative grid gap-10 md:grid-cols-5 md:gap-6", className)}>
    <span aria-hidden className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-white/25 md:left-0 md:top-[19px] md:h-px md:w-full" />
    {steps.map((s, i) => (
      <li key={s.title} className="relative grid grid-cols-[40px_1fr] gap-5 md:block">
        <span className="text-display tabular relative grid h-10 w-10 place-items-center bg-smk-red text-xl text-white">{i + 1}</span>
        <div className="md:mt-6">
          <h3 className="text-display text-3xl text-white">{s.title}</h3>
          <p className="mt-2 leading-relaxed text-white/75">{s.body}</p>
        </div>
      </li>
    ))}
  </ol>
);

export default Process;
