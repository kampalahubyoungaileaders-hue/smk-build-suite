/**
 * Portfolio. TODO before launch: confirm project names and descriptions with
 * SMK, and add more real site photos to each gallery.
 */
import site1 from "@/assets/site-1.webp";
import site2 from "@/assets/site-2.webp";
import site3 from "@/assets/site-3.webp";
import site4 from "@/assets/site-4.webp";
import site5 from "@/assets/site-5.webp";
import render1 from "@/assets/render-1.webp";
import interior1 from "@/assets/interior-1.webp";

export type Sector = "Residential" | "Commercial" | "Interiors" | "Civil works";

export type Project = {
  slug: string;
  title: string;
  sector: Sector;
  location: string;
  summary: string;
  description: string[];
  /** Service slugs, see content/services.ts */
  services: string[];
  cover: { src: string; alt: string };
  gallery: { src: string; alt: string }[];
};

export const projects: Project[] = [
  {
    slug: "smk-heights-residential",
    title: "SMK Heights Residential",
    sector: "Residential",
    location: "Kampala",
    summary: "A four-storey apartment block with secure parking and a landscaped frontage.",
    description: [
      "The client wanted rental apartments that would stand out on the street without running over budget. We designed a compact block with balconies on every level and a gated forecourt for parking.",
      "The 3D model was used to agree finishes with the client before a single block was laid, and the structural design was matched to the ground conditions on the plot.",
    ],
    services: ["engineering-design", "construction", "project-management"],
    cover: { src: render1, alt: "3D render of a four-storey apartment block with balconies and a gated forecourt" },
    gallery: [
      { src: site3, alt: "Block walls and scaffolding rising on a multi-storey site" },
      { src: site1, alt: "Engineers checking slab reinforcement before the pour" },
    ],
  },
  {
    slug: "nakasero-office-complex",
    title: "Nakasero Office Complex",
    sector: "Commercial",
    location: "Nakasero, Kampala",
    summary: "Structural works and suspended slabs for a mixed-use building.",
    description: [
      "The site sits between existing buildings, so deliveries, storage and working hours were planned around the neighbours.",
      "Hollow-block suspended slabs kept the structure light while giving the spans the client needed.",
    ],
    services: ["construction", "project-management"],
    cover: { src: site4, alt: "Workers laying hollow blocks for a suspended slab beside a tiled roof" },
    gallery: [{ src: site1, alt: "Slab reinforcement and hollow blocks ready for inspection" }],
  },
  {
    slug: "interior-fit-out",
    title: "Residential interior fit-out",
    sector: "Interiors",
    location: "Kampala",
    summary: "A living room feature wall with custom joinery and concealed lighting.",
    description: [
      "We designed and built a full-height media wall in timber finishes, with display niches and warm LED strips set into the joinery.",
      "Floor tiling and ceiling works were finished in the same programme so the room was handed over complete.",
    ],
    services: ["interiors"],
    cover: { src: interior1, alt: "Timber media wall with LED lighting and a matching coffee table" },
    gallery: [],
  },
  {
    slug: "infrastructure-development",
    title: "Infrastructure development",
    sector: "Civil works",
    location: "Western Region",
    summary: "Substructure and foundation works on a sloping site.",
    description: [
      "Uneven ground meant careful setting out and stepped foundations. Our team surveyed the site, excavated in stages and built the foundation walls to level.",
    ],
    services: ["construction", "project-management"],
    cover: { src: site2, alt: "Crew building stepped foundation walls on excavated ground" },
    gallery: [{ src: site5, alt: "SMK engineers setting out the site with survey equipment" }],
  },
];

export const sectors: Sector[] = ["Residential", "Commercial", "Interiors", "Civil works"];

export const getProject = (slug?: string) => projects.find((p) => p.slug === slug);
