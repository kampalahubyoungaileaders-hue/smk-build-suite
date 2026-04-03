import smkLogo from "@/assets/smk-logo.jpeg";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="h-1 bg-accent" />
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <img src={smkLogo} alt="SMK" className="h-14 w-auto rounded bg-primary-foreground p-1" />
            <p className="text-sm text-primary-foreground/70 max-w-xs leading-relaxed">
              SMK Technical Services & Real Estates Solutions Ltd
              <br />
              <em>"We Deliver Beyond Your Dream"</em>
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">How To Find Us</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li>WhatsApp: +256 752 981 600</li>
              <li>Phone: +256 705 070 635</li>
              <li>Kampala, Uganda</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Useful Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#home" className="hover:text-primary-foreground transition-colors">Home</a></li>
              <li><a href="#services" className="hover:text-primary-foreground transition-colors">Services</a></li>
              <li><a href="#about" className="hover:text-primary-foreground transition-colors">About Us</a></li>
              <li><a href="#projects" className="hover:text-primary-foreground transition-colors">Projects</a></li>
              <li><a href="#contact" className="hover:text-primary-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Useful Info</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a></li>
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
