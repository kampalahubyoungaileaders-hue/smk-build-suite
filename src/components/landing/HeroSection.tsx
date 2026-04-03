import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import site1 from "@/assets/site-1.png";
import site2 from "@/assets/site-2.png";
import render1 from "@/assets/render-1.png";

const HeroSection = () => {
  return (
    <section id="home" className="relative overflow-hidden bg-primary">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--smk-red)/0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--navy-light)/0.4),transparent_50%)]" />
      </div>

      <div className="container relative py-20 md:py-28 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground/90">
              <span className="h-2 w-2 rounded-full bg-smk-red animate-pulse" />
              Trusted by construction teams in Uganda
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Build Smarter,{" "}
              <span className="text-smk-red-light">Faster,</span>{" "}
              Better
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-lg leading-relaxed">
              Complete construction management platform designed for modern builders and contractors. Track projects, budgets, teams, and timelines all in one place.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-smk-red text-accent-foreground hover:bg-smk-red-dark rounded-full px-8 font-bold text-base h-12 shadow-lg shadow-smk-red/25"
              >
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-full px-8 font-semibold text-base h-12"
              >
                <Play className="mr-2 h-4 w-4" /> Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">150+</div>
                <div className="text-xs text-primary-foreground/60">Projects Managed</div>
              </div>
              <div className="h-8 w-px bg-primary-foreground/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">98%</div>
                <div className="text-xs text-primary-foreground/60">On-Time Delivery</div>
              </div>
              <div className="h-8 w-px bg-primary-foreground/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">500+</div>
                <div className="text-xs text-primary-foreground/60">Team Members</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src={render1}
                  alt="SMK architectural render"
                  className="rounded-2xl shadow-2xl object-cover w-full h-48"
                />
                <img
                  src={site2}
                  alt="SMK construction site"
                  className="rounded-2xl shadow-2xl object-cover w-full h-64"
                />
              </div>
              <div className="pt-8 space-y-4">
                <img
                  src={site1}
                  alt="SMK site supervisor"
                  className="rounded-2xl shadow-2xl object-cover w-full h-64"
                />
                <div className="rounded-2xl bg-primary-foreground/10 backdrop-blur p-5 border border-primary-foreground/10">
                  <div className="text-sm font-semibold text-primary-foreground mb-2">Project Progress</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-primary-foreground/70">
                      <span>SMK Heights</span><span>75%</span>
                    </div>
                    <div className="h-2 rounded-full bg-primary-foreground/10">
                      <div className="h-2 rounded-full bg-smk-red w-3/4 transition-all" />
                    </div>
                    <div className="flex justify-between text-xs text-primary-foreground/70">
                      <span>Nakasero Complex</span><span>15%</span>
                    </div>
                    <div className="h-2 rounded-full bg-primary-foreground/10">
                      <div className="h-2 rounded-full bg-smk-red-light w-[15%] transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
