import { testimonials } from "@/content/company";
import { initials } from "@/lib/format";

const Testimonials = () => (
  <section id="testimonials" className="bg-background py-20 md:py-28">
    <div className="container">
      <h2 className="max-w-2xl text-[40px] font-semibold leading-[1.05] text-foreground md:text-5xl">
        What our clients say
      </h2>

      <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
        {testimonials.map((t) => (
          <li key={t.name} className="flex flex-col border-t-[3px] border-navy pt-6">
            <blockquote className="flex-1 text-lg leading-relaxed text-foreground">
              <p>&ldquo;{t.quote}&rdquo;</p>
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <span
                aria-hidden
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy font-display text-[15px] font-semibold text-white"
              >
                {initials(t.name)}
              </span>
              <div>
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Testimonials;
