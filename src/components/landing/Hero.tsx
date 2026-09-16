import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { company } from "@/content/company";
import site5 from "@/assets/site-5.webp";
import site1 from "@/assets/site-1.webp";
import site3 from "@/assets/site-3.webp";

const Hero = () => (
  <section id="top" className="relative overflow-hidden bg-navy-dark text-white">
    <div className="container grid items-center gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-12 lg:py-24">
      <div className="lg:col-span-5">
        <p className="flex items-center gap-3 text-[15px] font-medium text-white/80">
          <span className="h-[3px] w-10 bg-smk-red-light" aria-hidden />
          Building across Uganda since {company.founded}
        </p>
        <h1 className="mt-6 text-[44px] font-semibold leading-[1.02] sm:text-[56px] lg:text-[64px]">
          Delivering the infrastructure of change.
        </h1>
        <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-white/85">
          Engineering, construction and project management for homes, offices and public works. Planned carefully,
          built safely, handed over on the date we agreed.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 rounded-sm bg-smk-red px-7 text-base font-semibold text-white hover:bg-smk-red-light">
            <a href="#contact">Request a quote</a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-sm border-white/40 bg-transparent px-6 text-base font-semibold text-white hover:bg-white hover:text-navy-dark"
          >
            <a href={company.phoneHref}>
              <Phone /> {company.phone}
            </a>
          </Button>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="grid h-[340px] grid-cols-5 grid-rows-2 gap-3 sm:h-[460px] lg:h-[540px]">
          <figure className="relative col-span-3 row-span-2 overflow-hidden rounded-sm">
            <img src={site5} alt="SMK site team setting out foundations" className="h-full w-full object-cover" fetchPriority="high" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-12 text-sm font-medium text-white">
              Setting out, Kampala
            </figcaption>
          </figure>
          <figure className="col-span-2 overflow-hidden rounded-sm">
            <img src={site1} alt="Engineers inspecting slab reinforcement" className="h-full w-full object-cover" />
          </figure>
          <figure className="col-span-2 overflow-hidden rounded-sm">
            <img src={site3} alt="Two-storey block under construction with scaffolding" className="h-full w-full object-cover" />
          </figure>
        </div>
      </div>
    </div>
    <div className="h-1.5 bg-smk-red" aria-hidden />
  </section>
);

export default Hero;
