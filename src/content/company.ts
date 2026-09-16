/**
 * Single source of truth for public company details.
 * Edit here and every page (navbar, contact, footer) updates.
 *
 * TODO before launch: confirm the stats and replace the sample testimonials
 * with real, attributable client quotes.
 */
export const company = {
  name: "SMK Technical Services & Real Estates Solutions Ltd",
  shortName: "SMK Technical Services",
  tagline: "We deliver beyond your dream",
  founded: 2024,
  location: "Kampala, Uganda",
  phone: "+256 705 070 635",
  phoneHref: "tel:+256705070635",
  whatsapp: "+256 752 981 600",
  whatsappNumber: "256752981600",
};

export const whatsappLink = (message?: string) =>
  `https://wa.me/${company.whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const companyStats = [
  { value: "50+", label: "Projects completed" },
  { value: "15+", label: "Engineers on staff" },
  { value: "200+", label: "Site workers" },
  { value: "2024", label: "Founded in Kampala" },
];

export const testimonials = [
  {
    name: "David Mukozi",
    role: "Project Manager, Small Contractors Ltd",
    quote:
      "SMK delivered our residential project ahead of schedule. The finish quality and the way they handled the site were exactly what we asked for.",
  },
  {
    name: "Jane Nalweyiso",
    role: "Finance Manager, Construction Group Uganda",
    quote:
      "Every shilling was accounted for. We got clear budget reports at each stage, and the final cost matched the estimate.",
  },
  {
    name: "Eng. Patrick Omondi",
    role: "Site Supervisor, Premier Builders",
    quote:
      "Their team keeps everyone aligned. Materials arrive when they should, and problems get raised before they become delays.",
  },
];
