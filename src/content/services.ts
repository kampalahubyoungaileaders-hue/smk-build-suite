import site1 from "@/assets/site-1.webp";
import site2 from "@/assets/site-2.webp";
import site5 from "@/assets/site-5.webp";
import render1 from "@/assets/render-1.webp";
import interior1 from "@/assets/interior-1.webp";

export type Service = {
  slug: string;
  title: string;
  /** One line for cards and menus */
  summary: string;
  image: string;
  imageAlt: string;
  /** Opening paragraphs on the service page */
  intro: string[];
  /** What is included */
  scope: { title: string; body: string }[];
  /** What the client receives */
  deliverables: string[];
  faqs: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "engineering-design",
    title: "Engineering and design",
    summary: "Architectural drawings, structural design and bills of quantities, ready for approval.",
    image: render1,
    imageAlt: "3D render of a four-storey apartment block designed by SMK",
    intro: [
      "Good buildings start on paper. We turn your brief, plot and budget into a complete set of drawings that a contractor can price accurately and an approving authority can pass.",
      "Our engineers design the structure for the soil on your site, so you are not paying for more concrete and steel than the building needs.",
    ],
    scope: [
      { title: "Site survey and soil assessment", body: "We measure the plot, record levels and check ground conditions before any design work begins." },
      { title: "Architectural design", body: "Floor plans, elevations, sections and 3D views so you can see the building before it is built." },
      { title: "Structural design", body: "Foundations, columns, beams and slabs sized by qualified engineers, with calculations on file." },
      { title: "Bills of quantities", body: "A priced list of every material and task, so you can compare quotes and plan your cash flow." },
      { title: "Plan approval support", body: "We prepare and submit the drawings and forms needed for building permission and follow them up." },
    ],
    deliverables: ["Architectural drawing set", "Structural drawings and calculations", "3D visualisations", "Bill of quantities", "Approval submission pack"],
    faqs: [
      { q: "Can you work from a design I already have?", a: "Yes. We review existing drawings, check the structure and update them for approval or construction." },
      { q: "How long does a design take?", a: "It depends on the size of the building and how quickly decisions are made. We agree a design programme with you at the first meeting." },
    ],
  },
  {
    slug: "construction",
    title: "Construction",
    summary: "Foundations to finishes for homes, commercial buildings and civil works.",
    image: site2,
    imageAlt: "SMK crew building foundation walls on a residential site",
    intro: [
      "Our site teams build from setting out to handover, with an engineer checking each structural stage before it is covered up.",
      "Materials are ordered against the bill of quantities and every purchase is recorded, so what you pay matches what was used.",
    ],
    scope: [
      { title: "Setting out and substructure", body: "Excavation, foundations, ground slabs and damp-proofing, set out to the approved drawings." },
      { title: "Superstructure", body: "Columns, beams, suspended slabs and walling, with reinforcement inspected before every pour." },
      { title: "Roofing", body: "Timber and steel roof structures with tile, sheet or concrete finishes." },
      { title: "Services", body: "Electrical, plumbing and drainage installed by qualified trades and tested before handover." },
      { title: "Finishes and external works", body: "Plaster, tiling, painting, paving, boundary walls and gates." },
    ],
    deliverables: ["Construction programme", "Stage inspection records", "Progress photos and reports", "As-built handover pack"],
    faqs: [
      { q: "Do you build in phases?", a: "Yes. Many clients build in stages as funds allow. We plan each phase so the structure is safe and weather-tight between them." },
      { q: "Can I supply some materials myself?", a: "You can. We agree in writing which materials you supply, the specification, and when they must arrive on site." },
    ],
  },
  {
    slug: "project-management",
    title: "Project management",
    summary: "One accountable team for schedule, procurement, cost and quality.",
    image: site5,
    imageAlt: "SMK engineers setting out a site with the client present",
    intro: [
      "Whether we are building or you have several contractors on site, we can manage the whole project on your behalf.",
      "You get one point of contact, clear decisions, and progress and spending reports you can read in a few minutes.",
    ],
    scope: [
      { title: "Planning and programme", body: "A realistic schedule with milestones, agreed before work starts." },
      { title: "Procurement", body: "Quotes compared, suppliers vetted, and every purchase approved before money is spent." },
      { title: "Cost control", body: "Spending tracked against the budget line by line, with variations agreed in writing." },
      { title: "Quality and safety", body: "Inspections at each stage, protective equipment for every worker and tidy, secure sites." },
      { title: "Reporting", body: "Regular progress updates with photos, so you can follow the build from anywhere." },
    ],
    deliverables: ["Project programme", "Budget and cost reports", "Site inspection records", "Photo progress updates"],
    faqs: [
      { q: "I live outside Uganda. Can you manage my build?", a: "Yes. We send photo updates and cost reports you can review remotely, and payments are released against agreed milestones." },
      { q: "How do I know money is being spent correctly?", a: "Every expense is recorded and approved in our project system, and you see the totals against your budget in each report." },
    ],
  },
  {
    slug: "interiors",
    title: "Interiors and fit-out",
    summary: "Joinery, lighting, ceilings and finishes that complete the building.",
    image: interior1,
    imageAlt: "Living room wall unit with timber slats and warm LED lighting",
    intro: [
      "The finish is what you live with every day. We design and install interiors that are built to last in Uganda's climate.",
      "Our joiners, electricians and finishers work from one plan, so the details line up.",
    ],
    scope: [
      { title: "Interior design", body: "Layouts, material and colour choices, and drawings you can approve before work starts." },
      { title: "Joinery", body: "Wall units, wardrobes, kitchens and doors made to measure." },
      { title: "Ceilings and lighting", body: "Gypsum ceilings, feature lighting and concealed LED details." },
      { title: "Floors and walls", body: "Tiling, wood finishes, wall panelling and paint." },
    ],
    deliverables: ["Interior layouts and 3D views", "Material schedule", "Installed and finished rooms"],
    faqs: [
      { q: "Do you fit out buildings you did not build?", a: "Yes. We survey the space first and work with what is already there." },
    ],
  },
  {
    slug: "real-estate",
    title: "Real estate solutions",
    summary: "Help finding, developing and managing property.",
    image: site1,
    imageAlt: "Engineers checking slab reinforcement on a development site",
    intro: [
      "Buying land or developing property involves more than construction. We help you check a site, plan what to build on it and look after it once it is finished.",
    ],
    scope: [
      { title: "Site checks", body: "Access, ground conditions and what the plot can realistically hold, before you commit." },
      { title: "Development planning", body: "Concepts and cost estimates for rental units, apartments and commercial space." },
      { title: "Property management", body: "Maintenance, repairs and upkeep for completed buildings." },
    ],
    deliverables: ["Site assessment report", "Development concept and estimate", "Maintenance plan"],
    faqs: [
      { q: "Can you tell me what a plot is worth building on?", a: "We can assess the site and estimate construction costs for different options, which helps you decide. For valuations we work alongside registered valuers." },
    ],
  },
];

export const getService = (slug?: string) => services.find((s) => s.slug === slug);
