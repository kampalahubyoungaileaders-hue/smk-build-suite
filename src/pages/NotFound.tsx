import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
    <Logo markClassName="h-12" />
    <h1 className="mt-10 text-[40px] font-semibold leading-tight text-foreground">Page not found</h1>
    <p className="mt-2 max-w-md text-muted-foreground">The link may be old or mistyped. Head back to the home page or to your dashboard.</p>
    <div className="mt-6 flex gap-3">
      <Button asChild><Link to="/">Home page</Link></Button>
      <Button asChild variant="outline"><Link to="/dashboard">Dashboard</Link></Button>
    </div>
  </div>
);

export default NotFound;
