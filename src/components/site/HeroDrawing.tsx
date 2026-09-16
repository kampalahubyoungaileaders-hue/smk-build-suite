import { Link } from "react-router-dom";
import render1 from "@/assets/render-1.webp";

/** Elevation of a two-storey building, drawn line by line on load. */
const sketch = [
  "M20 372 H540", // ground
  "M90 372 V150 H470 V372", // walls
  "M78 262 H482", // first-floor slab
  "M70 150 L190 72 H370 L490 150", // roof
  "M120 292 h66 v56 h-66 Z", // ground windows
  "M374 292 h66 v56 h-66 Z",
  "M250 282 h60 v90 h-60 Z", // door
  "M120 182 h66 v52 h-66 Z", // first-floor windows
  "M374 182 h66 v52 h-66 Z",
  "M220 176 h120 v86 h-120 Z", // balcony opening
  "M210 238 H350 M210 250 H350 M230 238 v24 M255 238 v24 M280 238 v24 M305 238 v24 M330 238 v24",
];

const HeroDrawing = () => (
  <figure className="relative mx-auto w-full max-w-[640px] pl-10 pt-10 lg:ml-auto lg:mr-0">
    <div className="relative">
      {/* Overall dimensions, drafting style */}
      <div aria-hidden className="absolute -top-7 left-0 right-0 text-white/55">
        <span className="dim-x absolute inset-x-0 top-1/2 h-px bg-current" />
        <span
          className="draw-fade absolute left-0 top-[-6px] h-3 w-px bg-current"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="draw-fade absolute right-0 top-[-6px] h-3 w-px bg-current"
          style={{ animationDelay: "0.9s" }}
        />
        <span
          className="draw-fade tabular absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white/70"
          style={{ animationDelay: "1s" }}
        >
          14 200
        </span>
      </div>
      <div
        aria-hidden
        className="absolute -left-7 bottom-0 top-0 text-white/55"
      >
        <span className="dim-y absolute inset-y-0 left-1/2 w-px bg-current" />
        <span
          className="draw-fade absolute left-[-6px] top-0 h-px w-3 bg-current"
          style={{ animationDelay: "0.3s" }}
        />
        <span
          className="draw-fade absolute bottom-0 left-[-6px] h-px w-3 bg-current"
          style={{ animationDelay: "1s" }}
        />
        <span
          className="draw-fade tabular absolute -left-6 top-1/2 -translate-y-1/2 rotate-180 text-xs text-white/70 [writing-mode:vertical-rl]"
          style={{ animationDelay: "1.1s" }}
        >
          10 600
        </span>
      </div>

      <div className="relative aspect-[5/4] overflow-hidden rounded-[2px] border border-white/25 bg-white/[0.03]">
        <svg
          viewBox="0 0 560 420"
          className="draw-sketch absolute inset-0 h-full w-full text-white"
          aria-hidden
        >
          {sketch.map((d, i) => (
            <path
              key={d}
              d={d}
              pathLength={1}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinejoin="round"
              className="draw-line"
              style={{ animationDelay: `${0.35 + i * 0.12}s` }}
            />
          ))}
          <g
            className="draw-fade fill-white/70 text-[11px]"
            style={{ animationDelay: "1.6s" }}
          >
            <text x="488" y="376">
              ±0.00
            </text>
            <text x="488" y="266">
              +3.20
            </text>
            <text x="496" y="154">
              +6.40
            </text>
          </g>
        </svg>
        <img
          src={render1}
          alt="SMK Heights Residential, a four-storey apartment block designed by SMK"
          className="draw-reveal absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
      </div>
    </div>

    {/* Drawing title block */}
    <figcaption
      className="draw-fade relative -mt-px ml-auto grid w-full max-w-[380px] grid-cols-[auto_1fr] border border-t-0 border-white/25 bg-navy-dark text-sm sm:-mt-16 sm:mr-[-1px] sm:border-t"
      style={{ animationDelay: "2.6s" }}
    >
      <span className="border-b border-r border-white/15 px-3 py-2 text-white/60">
        Project
      </span>
      <span className="border-b border-white/15 px-3 py-2 font-medium text-white">
        SMK Heights Residential
      </span>
      <span className="border-r border-white/15 px-3 py-2 text-white/60">
        Scope
      </span>
      <span className="flex items-center justify-between gap-3 px-3 py-2 text-white">
        Design and build
        <Link
          to="/projects/smk-heights-residential"
          className="font-medium text-smk-red-light underline-offset-4 hover:underline"
        >
          View project
        </Link>
      </span>
    </figcaption>
  </figure>
);

export default HeroDrawing;
