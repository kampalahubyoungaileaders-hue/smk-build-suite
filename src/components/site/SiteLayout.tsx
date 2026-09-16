import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { whatsappLink } from "@/content/company";

const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname, hash]);
  return null;
};

const SiteLayout = () => (
  <div className="flex min-h-screen flex-col bg-white">
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-[2px] focus:bg-white focus:px-4 focus:py-2 focus:text-foreground"
    >
      Skip to content
    </a>
    <ScrollManager />
    <Header />
    <main id="main" className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <a
      href={whatsappLink("Hello SMK, I have a question.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with SMK on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#1FA855] text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] transition-transform hover:scale-105"
    >
      <MessageCircle size={26} aria-hidden />
    </a>
  </div>
);

export default SiteLayout;
