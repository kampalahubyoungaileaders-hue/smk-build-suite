import smkLogo from "@/assets/smk-logo.jpeg";

const Footer = () => {
  return (
    <footer className="bg-navy-dark text-primary-foreground">
      <div className="h-1 bg-accent" />
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <img src={smkLogo} alt="SMK" className="h-14 w-auto rounded bg-primary-foreground p-1" />
            <p className="text-sm text-primary-foreground/70 max-w-xs leading-relaxed">
              SMK Technical Services & Real Estates Solutions Ltd
              <br />
              <em>"We Deliver Beyond Your Dream"</em>
            </p>
            <div className="text-sm text-primary-foreground/60 space-y-1">
              <div>WhatsApp: +256 752 981 600</div>
              <div>Phone: +256 705 070 635</div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#features" className="hover:text-primary-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-primary-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">API Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#about" className="hover:text-primary-foreground transition-colors">About SMK</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Careers</a></li>
              <li><a href="#contact" className="hover:text-primary-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-xs text-primary-foreground/40">
          © 2024 SMK Technical Services & Real Estates Solutions Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
