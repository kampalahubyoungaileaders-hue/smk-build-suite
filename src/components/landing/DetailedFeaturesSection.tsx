import { Button } from "@/components/ui/button";
import site5 from "@/assets/site-5.png";

const DetailedFeaturesSection = () => {
  return (
    <section id="about" className="py-20 md:py-28 bg-surface">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-6">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider">
              About SMK Technical Services
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Going Beyond
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              At SMK Technical Services & Real Estates Solutions Ltd, we combine engineering expertise with a passion for excellence. From large-scale infrastructure to bespoke residential projects, our team delivers results that exceed expectations — on schedule and within budget.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              With years of experience across Uganda and the region, we've built a reputation for reliability, quality workmanship, and client-first project management. Our approach is always to begin with the customer's needs in mind.
            </p>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-extrabold text-accent">150+</div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="text-3xl font-extrabold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Client Satisfaction</div>
              </div>
            </div>

            <a href="#contact">
              <Button className="bg-accent text-accent-foreground hover:bg-smk-red-dark rounded px-8 font-bold h-11 mt-2">
                Learn More
              </Button>
            </a>
          </div>

          {/* Images */}
          <div className="relative">
            <img
              src={site5}
              alt="SMK construction project"
              className="w-full h-80 object-cover rounded"
            />
            <div className="absolute -bottom-6 -left-4 bg-primary text-primary-foreground p-4 rounded hidden md:block">
              <div className="text-xs text-primary-foreground/70 mb-1">Established</div>
              <div className="text-2xl font-extrabold">SMK</div>
              <div className="text-xs text-primary-foreground/70">Uganda</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Need Button import
import { Button } from "@/components/ui/button";

export default DetailedFeaturesSection;
