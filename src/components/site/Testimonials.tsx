import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { testimonials } from "@/content/company";

/** One quote at a time, large. */
const Testimonials = () => {
  const [i, setI] = useState(0);
  const t = testimonials[i];
  const go = (d: number) => setI((n) => (n + d + testimonials.length) % testimonials.length);

  return (
    <section aria-labelledby="testimonials-title" className="bg-white py-24 md:py-32">
      <div className="container grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="testimonials-title" className="text-display text-[44px] text-navy-dark md:text-6xl">
            Clients on working with us
          </h2>
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="grid h-12 w-12 place-items-center rounded-[2px] border border-navy/25 text-navy-dark hover:bg-navy-dark hover:text-white"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="grid h-12 w-12 place-items-center rounded-[2px] border border-navy/25 text-navy-dark hover:bg-navy-dark hover:text-white"
            >
              <ChevronRight />
            </button>
            <span className="tabular ml-2 text-muted-foreground" aria-live="polite">
              {i + 1} of {testimonials.length}
            </span>
          </div>
        </div>

        <figure key={t.name} className="animate-in fade-in duration-500 lg:col-span-8">
          <svg aria-hidden viewBox="0 0 48 36" className="h-10 w-auto fill-smk-red">
            <path d="M0 36V21.6C0 9.4 6.2 2.2 18.6 0l2.2 4.4C14 6.2 10.6 10 10.3 16.2H19V36H0Zm29 0V21.6C29 9.4 35.2 2.2 47.6 0l2.2 4.4C43 6.2 39.6 10 39.3 16.2H48V36H29Z" />
          </svg>
          <blockquote className="mt-6 text-2xl leading-snug text-navy-dark md:text-[34px] md:leading-[1.3]">
            <p>{t.quote}</p>
          </blockquote>
          <figcaption className="mt-8 border-l-[3px] border-smk-red pl-4">
            <span className="block text-lg font-semibold text-navy-dark">{t.name}</span>
            <span className="block text-muted-foreground">{t.role}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
};

export default Testimonials;
