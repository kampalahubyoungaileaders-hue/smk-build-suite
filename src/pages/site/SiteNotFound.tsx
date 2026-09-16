import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/site/PageHero";
import { useDocumentTitle } from "@/components/site/useDocumentTitle";

const SiteNotFound = () => {
  useDocumentTitle("Page not found");
  return (
    <PageHero title="This page isn't here" lead="The link may be out of date. Try one of these instead.">
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg" className="h-12 rounded-[2px] bg-smk-red font-semibold hover:bg-smk-red-dark">
          <Link to="/">Go to the home page</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 rounded-[2px] border-white/40 bg-transparent font-semibold text-white hover:bg-white hover:text-navy-dark">
          <Link to="/projects">See our projects</Link>
        </Button>
      </div>
    </PageHero>
  );
};

export default SiteNotFound;
