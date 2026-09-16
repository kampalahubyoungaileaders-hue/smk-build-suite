import render1 from "@/assets/render-1.webp";
import site4 from "@/assets/site-4.webp";
import interior1 from "@/assets/interior-1.webp";
import site2 from "@/assets/site-2.webp";

const projects = [
  {
    image: render1,
    alt: "Architectural render of a multi-storey residential block",
    title: "SMK Heights Residential",
    category: "Residential",
    location: "Kampala",
  },
  {
    image: site4,
    alt: "Office building structure under construction",
    title: "Nakasero Office Complex",
    category: "Commercial",
    location: "Nakasero, Kampala",
  },
  {
    image: interior1,
    alt: "Finished interior with modern fittings",
    title: "Interior fit-out works",
    category: "Interiors",
    location: "Kampala",
  },
  {
    image: site2,
    alt: "Civil works crew on an infrastructure site",
    title: "Infrastructure development",
    category: "Civil works",
    location: "Western Region",
  },
];

const Projects = () => (
  <section id="projects" className="border-t bg-white py-20 md:py-28">
    <div className="container">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="text-[40px] font-semibold leading-[1.05] text-foreground md:text-5xl">Selected projects</h2>
        <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
          Homes, offices, interiors and civil works delivered for private and public clients.
        </p>
      </div>

      <ul className="mt-12 grid gap-x-6 gap-y-10 md:grid-cols-3">
        {projects.map((p, i) => (
          <li key={p.title} className={i === 0 ? "md:col-span-3" : ""}>
            <figure className="group">
              <div className={`overflow-hidden rounded-sm bg-muted ${i === 0 ? "aspect-[4/3] md:aspect-[21/9]" : "aspect-[4/3]"}`}>
                <img
                  src={p.image}
                  alt={p.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b pb-4">
                <span className="text-2xl font-semibold text-foreground">{p.title}</span>
                <span className="text-[15px] text-muted-foreground">
                  <span className="font-medium text-smk-red">{p.category}</span>
                  <span aria-hidden> · </span>
                  {p.location}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Projects;
