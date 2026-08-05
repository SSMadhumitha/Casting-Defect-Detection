"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import {
  HiOutlineBookOpen,
  HiOutlineSearch,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineLightBulb,
  HiOutlineShieldCheck,
  HiOutlineFilter,
  HiOutlineShieldExclamation,
  HiOutlineBadgeCheck,
} from "react-icons/hi";

interface DefectItem {
  id: string;
  name: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  severityColor: string;
  astmStandard: string;
  icon: string;
  description: string;
  causes: string[];
  prevention: string[];
  remediation: string;
}

const DEFECT_CATALOG: DefectItem[] = [
  {
    id: "porosity",
    name: "Gas Porosity & Micro-Voids",
    category: "Gas Voids",
    severity: "High",
    severityColor: "#f87171",
    astmStandard: "ASTM E155 Vol 1, Class 2-4",
    icon: "🫧",
    description:
      "Spherical or elongated smooth-walled cavities caused by dissolved hydrogen or air entrapment in molten metal during pouring and solidification.",
    causes: [
      "Moisture in molding sand or crucible lining",
      "High pouring temperature causing elevated gas solubility",
      "Inadequate venting in mold cavities",
    ],
    prevention: [
      "Use degassing agents (argon/chlorine purging) before pouring",
      "Preheat ladles and check sand moisture content (<1.5%)",
      "Increase mold permeability and add riser vents",
    ],
    remediation:
      "Minor surface porosity can be sealed using vacuum impregnation with high-temp resin; structural voids require scrap and re-melt.",
  },
  {
    id: "shrinkage",
    name: "Shrinkage Cavity",
    category: "Thermal Shrinkage",
    severity: "Critical",
    severityColor: "#ef4444",
    astmStandard: "ASTM E155 Vol 2, Class 3-5",
    icon: "⚡",
    description:
      "Irregular, jagged internal voids formed when feeding liquid metal is insufficient to compensate for volumetric contraction during phase transition.",
    causes: [
      "Improper riser placement or insufficient riser volume",
      "Abrupt section thickness transitions in casting design",
      "Premature freezing of feeding channels (ingates)",
    ],
    prevention: [
      "Apply directional solidification principles with chills & sleeves",
      "Redesign wall intersections using generous fillets",
      "Optimize pouring speed and thermal gradient management",
    ],
    remediation:
      "Critical load-bearing structural castings with shrinkage cavities must be rejected. Weld repair permitted only on non-critical zones per AWS D1.1.",
  },
  {
    id: "inclusion",
    name: "Sand & Slag Inclusions",
    category: "Foreign Particle",
    severity: "Medium",
    severityColor: "#f59e0b",
    astmStandard: "ASTM E155 Vol 1, Class 1-3",
    icon: "🪨",
    description:
      "Non-metallic particles (sand grains, oxide films, slag runner dross) trapped in the solid metal structure during liquid flow.",
    causes: [
      "Erosion of unbonded sand grains from runner system",
      "Inadequate slag skimming before pouring",
      "Turbulent mold filling dislodging gating refractory material",
    ],
    prevention: [
      "Install ceramic foam filters in pouring basin/gating system",
      "Apply refractory mold coatings (zircon washes)",
      "Design pressurized gating systems to maintain non-turbulent laminar flow",
    ],
    remediation:
      "Surface inclusions can be ground out and blend-machined within dimensional tolerance. Deep inclusions require excavation and certified weld repair.",
  },
  {
    id: "crack",
    name: "Hot Tears & Stress Cracks",
    category: "Stress Fracture",
    severity: "Critical",
    severityColor: "#dc2626",
    astmStandard: "ASTM E155 Vol 3, Class 4-5",
    icon: "💥",
    description:
      "Intergranular tear fractures occurring at elevated temperatures near solidification completion due to severe mechanical constraint during contraction.",
    causes: [
      "Excessive mechanical resistance from rigid cores or molds",
      "High thermal gradients between thin and thick sections",
      "Excessive tramp elements (sulfur, phosphorus) promoting hot-shortness",
    ],
    prevention: [
      "Increase core collapsibility (use organic binder systems)",
      "Uniform section design and transition radii",
      "Refine grain structure with titanium/boron grain refiners",
    ],
    remediation:
      "Hot tears in pressure-retaining components result in immediate rejection. Non-critical areas require dye penetrant testing (PT) after gouging and stress-relief welding.",
  },
  {
    id: "blowhole",
    name: "Surface Blowholes & Pinholes",
    category: "Gas Voids",
    severity: "Medium",
    severityColor: "#f59e0b",
    astmStandard: "ASTM E155 Vol 1, Class 1-2",
    icon: "🕳️",
    description:
      "Smooth round gas pockets located directly on or just beneath the cast skin, often exposed during preliminary machining passes.",
    causes: [
      "Excessive binder decomposition gas in core sand",
      "Oxide reactions at liquid metal-mold interface",
      "Chilled iron mold condensation prior to pour",
    ],
    prevention: [
      "Bake sand cores thoroughly prior to mold assembly",
      "Apply low-gas binder formulations",
      "Preheat permanent molds to >180°C prior to cycle commencement",
    ],
    remediation:
      "Cosmetic surface pinholes can be blended or micro-welded using TIG welding followed by stress relief.",
  },
  {
    id: "coldshut",
    name: "Cold Shut & Flow Lap",
    category: "Discontinuity",
    severity: "High",
    severityColor: "#f87171",
    astmStandard: "ASTM E155 Vol 2, Class 2-4",
    icon: "🌊",
    description:
      "Interface line where two converging streams of liquid metal met but failed to fuse completely due to low thermal energy or oxide barrier.",
    causes: [
      "Pouring liquid metal at too low a temperature",
      "Interrupted or hesitant pouring stream",
      "Excessive distance between ingates causing cold metal fronts",
    ],
    prevention: [
      "Increase pouring temperature within specified alloy range",
      "Optimize gating stream geometry to minimize path length",
      "Utilize automated ladle pouring systems for consistent flow rate",
    ],
    remediation:
      "Requires ultrasonic thickness gauging (UT) to determine fusion depth. Unfused joints in stress zones require rejection.",
  },
];

export default function DefectsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeDefect, setActiveDefect] = useState<DefectItem | null>(null);

  const categories = ["All", "Gas Voids", "Thermal Shrinkage", "Foreign Particle", "Stress Fracture", "Discontinuity"];

  const filtered = DEFECT_CATALOG.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.astmStandard.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-content">
        <main className="page-main">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
                📖 Technical Knowledge Base
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Casting Defect Catalog</h1>
              <p className="text-slate-400 text-sm mt-1">
                Industrial ASTM E155 / ISO 9001 quality reference guide for NDT non-destructive testing & AI classification.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="glass px-4 py-2 text-xs text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>6 Standards Loaded</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search defects, standards, causes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/80 border border-cyan-500/20 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <span className="absolute left-3 top-3 text-slate-500 text-base">🔍</span>
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                      : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-cyan-500/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Defects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((defect) => (
              <div
                key={defect.id}
                onClick={() => setActiveDefect(defect)}
                className="glass-card p-6 rounded-2xl cursor-pointer hover:border-cyan-500/40 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-cyan-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {defect.icon}
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${defect.severityColor}15`,
                        color: defect.severityColor,
                        border: `1px solid ${defect.severityColor}30`,
                      }}
                    >
                      {defect.severity} Risk
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                    {defect.name}
                  </h3>
                  <div className="text-xs text-cyan-500 font-mono mb-3">{defect.astmStandard}</div>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4">
                    {defect.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{defect.category}</span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Protocol →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal / Detailed view overlay */}
          {activeDefect && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
              <div className="glass-panel max-w-2xl w-full p-6 md:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setActiveDefect(null)}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-lg"
                >
                  ✕
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl">
                    {activeDefect.icon}
                  </div>
                  <div>
                    <span
                      className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${activeDefect.severityColor}20`,
                        color: activeDefect.severityColor,
                      }}
                    >
                      {activeDefect.severity} Severity
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">{activeDefect.name}</h2>
                    <p className="text-xs text-cyan-400 font-mono">{activeDefect.astmStandard}</p>
                  </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed mb-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  {activeDefect.description}
                </p>

                {/* Root Causes */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    ⚠️ Primary Root Causes
                  </h4>
                  <ul className="space-y-2">
                    {activeDefect.causes.map((c, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention Protocol */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    🛡️ Prevention & Mitigation Strategy
                  </h4>
                  <ul className="space-y-2">
                    {activeDefect.prevention.map((p, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Remediation */}
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                    🔧 Quality Control Remediation
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeDefect.remediation}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
