import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/components/site/useDocumentTitle";
import { getProject, projects } from "@/content/projects";
import { services } from "@/content/services";

const ProjectCase = () => {
  const { slug } = useParams();
  const project = getProject(slug);
  useDocumentTitle(project?.title);
  if (!project) return <Navigate to="/projects" replace />;

  const idx = projects.indexOf(project);
  const next = projects[(idx + 1) % projects.length];
  const usedServices = services.filter((s) => project.services.includes(s.slug));

  return (
    <>
      <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-navy-dark text-white">
        <img src={project.cover.src} alt={project.cover.alt} className="absolute inset-0 -z-10 h-full w-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-dark via-navy-dark/55 to-navy-dark/40" />
        <div className="container pb-14 pt-40 md:pb-20">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/75">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden><ChevronRight size={14} /></li>
              <li><Link to="/projects" className="hover:text-white">Projects</Link></li>
              <li aria-hidden><ChevronRight size={14} /></li>
              <li aria-current="page" className="text-white">{project.title}</li>
            </ol>
          </nav>
          <h1 className="text-display mt-6 max-w-4xl text-[52px] sm:text-7xl lg:text-[96px]">{project.title}</h1>
          <p className="mt-5 max-w-xl text-lg text-white/85 md:text-xl">{project.summary}</p>
        </div>
      </section>
      <div className="h-1.5 bg-smk-red" aria-hidden />

      <section className="bg-white py-20 md:py-28">
        <div className="container grid gap-14 lg:grid-cols-12">
          <dl className="grid h-max grid-cols-2 gap-px overflow-hidden rounded-[2px] bg-navy/15 lg:col-span-4 lg:grid-cols-1">
            <div className="bg-white p-6 lg:pl-0">
              <dt className="text-sm text-muted-foreground">Sector</dt>
              <dd className="text-display mt-1 text-2xl text-navy-dark">{project.sector}</dd>
            </div>
            <div className="bg-white p-6 lg:pl-0">
              <dt className="text-sm text-muted-foreground">Location</dt>
              <dd className="text-display mt-1 text-2xl text-navy-dark">{project.location}</dd>
            </div>
            <div className="col-span-2 bg-white p-6 lg:col-span-1 lg:pl-0">
              <dt className="text-sm text-muted-foreground">Our role</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {usedServices.map((s) => (
                  <Link key={s.slug} to={`/services/${s.slug}`} className="rounded-[2px] border border-navy/20 px-3 py-1.5 text-sm font-medium text-navy-dark hover:border-navy-dark">
                    {s.title}
                  </Link>
                ))}
              </dd>
            </div>
          </dl>

          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground lg:col-span-7 lg:col-start-6">
            {project.description.map((p, i) => (
              <p key={i} className={i === 0 ? "text-2xl leading-snug text-navy-dark md:text-[28px]" : undefined}>
                {p}
              </p>
            ))}
            <Button asChild size="lg" className="!mt-10 h-[52px] rounded-[2px] bg-smk-red px-7 text-base font-semibold hover:bg-smk-red-dark">
              <Link to="/contact">Plan a project like this</Link>
            </Button>
          </div>
        </div>

        {project.gallery.length > 0 && (
          <div className="container mt-20">
            <h2 className="sr-only">Photos</h2>
            <ul className="grid gap-6 md:grid-cols-2">
              {project.gallery.map((g) => (
                <li key={g.src + g.alt}>
                  <figure>
                    <img src={g.src} alt={g.alt} loading="lazy" className="aspect-[4/3] w-full rounded-[2px] object-cover" />
                    <figcaption className="mt-3 text-sm text-muted-foreground">{g.alt}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <nav aria-label="More projects" className="border-t bg-[hsl(216_30%_95%)]">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-10">
          <Link to="/projects" className="flex items-center gap-2 font-semibold text-navy-dark hover:text-smk-red">
            <ArrowLeft size={18} aria-hidden /> All projects
          </Link>
          <Link to={`/projects/${next.slug}`} className="group flex items-center gap-4 text-right">
            <span>
              <span className="block text-sm text-muted-foreground">Next project</span>
              <span className="text-display block text-3xl text-navy-dark group-hover:text-smk-red">{next.title}</span>
            </span>
            <ArrowRight className="text-smk-red" aria-hidden />
          </Link>
        </div>
      </nav>
    </>
  );
};

export default ProjectCase;
