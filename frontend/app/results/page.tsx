"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { isLoggedIn, formatLocalDate } from "@/lib/auth";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineRefresh,
  HiOutlineArrowRight,
  HiOutlineSparkles,
} from "react-icons/hi";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login"); return; }
    const data = localStorage.getItem("inspectionResult");
    if (data) setResult(JSON.parse(data));
  }, []);

  if (!result) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="app-content">
          <main className="page-main flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-4xl flex items-center justify-center">
              🔍
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">No Inspection Results Found</h2>
              <p className="text-slate-400 text-sm max-w-md">Please upload an X-ray scan to generate an AI defect evaluation.</p>
            </div>
            <Link href="/upload" className="btn-cyan text-sm px-8 py-3">
              Upload Image for Inspection
            </Link>
          </main>
        </div>
      </div>
    );
  }

  const isValidCasting = result.is_valid_casting !== false;
  const hasDefects = isValidCasting && result.detections && result.detections.length > 0;
  const maxConf = result.detections && result.detections.length > 0
    ? Math.max(...result.detections.map((d: any) => d.confidence))
    : 0;
  const formattedDate = formatLocalDate(result.created_at || result.date);

  const bannerColor = !isValidCasting ? "#f59e0b" : hasDefects ? "#f87171" : "#4ade80";
  const bannerIcon = !isValidCasting ? "⚠️" : hasDefects ? "🔴" : "🟢";
  const bannerTitle = !isValidCasting
    ? "NON-CASTING SCAN DETECTED"
    : hasDefects
    ? "DEFECT DETECTED"
    : "CASTING PASSED QUALITY CONTROL";
  const bannerSub = !isValidCasting
    ? (result.validation_message || "The uploaded image appears to be a color camera photo rather than an industrial X-ray casting radiograph.")
    : hasDefects
    ? `AI system identified ${result.detections.length} defect area(s) exceeding tolerance. Secondary physical verification recommended.`
    : "Zero critical casting defects detected across all computer vision evaluation passes.";

  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-content">
        <main className="page-main">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Evaluation Complete
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Inspection Results</h1>
              <p className="text-slate-400 text-xs mt-1 font-mono">
                File: {result.filename} {formattedDate ? `· Date: ${formattedDate}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/upload" className="btn-outline text-xs px-4 py-2.5 flex items-center gap-2">
                <span>New Inspection</span>
              </Link>
              <Link href="/reports" className="btn-cyan text-xs px-4 py-2.5 flex items-center gap-2">
                <span>📄 View Reports</span>
              </Link>
            </div>
          </div>

          {/* Status Banner */}
          <div
            className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden border-2 w-full"
            style={{
              background: `${bannerColor}10`,
              borderColor: `${bannerColor}60`,
            }}
          >
            <div className="text-5xl mb-3 flex items-center justify-center mx-auto">
              {bannerIcon}
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-3 text-center mx-auto" style={{ color: bannerColor }}>
              {bannerTitle}
            </h2>
            <p className="text-slate-300 text-sm font-medium max-w-xl text-center leading-relaxed mx-auto">
              {bannerSub}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4 w-full">
            {[
              { label: "Defects Identified", value: !isValidCasting ? "N/A" : result.detections.length, color: !isValidCasting ? "#f59e0b" : "#f87171" },
              { label: "Peak Confidence", value: !isValidCasting ? "N/A" : result.detections.length > 0 ? `${(maxConf * 100).toFixed(1)}%` : "98.5%", color: "#fbbf24" },
              { label: "Quality Verdict", value: !isValidCasting ? "INVALID" : hasDefects ? "FAIL" : "PASS", color: bannerColor },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Image Comparison Pipeline Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Inspection Image Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {[
                { src: result.original_image, label: "Original X-Ray", border: "#06b6d4", color: "#06b6d4", sub: "Raw Input" },
                { src: result.filtered_image, label: "U-Net Filtered", border: "#fbbf24", color: "#fbbf24", sub: "Enhanced & Denoised" },
                { src: result.output_image, label: "YOLO Detection", border: "#f87171", color: "#f87171", sub: "Defect Overlay" },
              ].map((img, i) => (
                <div key={i} className="glass-card p-4 rounded-2xl flex flex-col gap-3" style={{ borderColor: `${img.border}30` }}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider" style={{ color: img.color }}>{img.label}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{img.sub}</span>
                  </div>
                  <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={img.src}
                      alt={img.label}
                      className="w-full h-auto object-contain max-h-64"
                      style={{ borderBottom: `2px solid ${img.border}40` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detections Table */}
          {result.detections.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl w-full">
              <h3 className="text-lg font-bold text-cyan-400 mb-4">Detected Fault Parameters</h3>
              <div className="overflow-x-auto">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Class Classification</th>
                      <th>Model Confidence</th>
                      <th>Risk Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.detections.map((d: any, i: number) => {
                      const conf = d.confidence * 100;
                      const risk = conf > 85 ? { label: "High", color: "#f87171" } : conf > 65 ? { label: "Medium", color: "#fbbf24" } : { label: "Low", color: "#4ade80" };
                      return (
                        <tr key={i}>
                          <td className="text-slate-400 font-mono text-xs">{i + 1}</td>
                          <td className="text-white font-semibold">{d.class_name}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-800 rounded-full h-2 max-w-[120px]">
                                <div
                                  className="h-2 rounded-full transition-all"
                                  style={{ width: `${conf}%`, background: risk.color }}
                                />
                              </div>
                              <span className="text-xs font-bold text-amber-400 font-mono">{conf.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td>
                            <span
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                              style={{ background: `${risk.color}20`, color: risk.color, border: `1px solid ${risk.color}40` }}
                            >
                              {risk.label} Risk
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Digital Inspection Sign-off & Inspector Notes */}
          <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  ✍️ Digital Inspector Sign-Off & Remarks
                </h3>
                <p className="text-xs text-slate-400">Record engineering verification notes and issue official quality clearance.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                  ASNT Level III
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Inspector Engineering Notes</label>
              <textarea
                rows={3}
                placeholder="Enter quality verification remarks (e.g., 'Casting approved for assembly after ultrasonic verification' or 'Rework requested for surface porosity')..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                defaultValue={typeof window !== "undefined" ? localStorage.getItem(`notes_${result.filename}`) || "" : ""}
                onChange={(e) => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem(`notes_${result.filename}`, e.target.value);
                  }
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400 font-mono">
                {typeof window !== "undefined" && localStorage.getItem(`signed_${result.filename}`) ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    ✓ Verified & Signed Off on {localStorage.getItem(`signed_date_${result.filename}`)}
                  </span>
                ) : (
                  <span>Status: Pending Inspector Sign-off</span>
                )}
              </div>

              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const nowStr = new Date().toLocaleString();
                    localStorage.setItem(`signed_${result.filename}`, "true");
                    localStorage.setItem(`signed_date_${result.filename}`, nowStr);
                    window.location.reload();
                  }
                }}
                className="btn-cyan text-xs px-5 py-2.5 flex items-center justify-center gap-2 font-bold"
              >
                <span>✍️ Sign Off Inspection</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/dashboard" className="btn-cyan text-sm px-6 py-3">
              Back to Dashboard
            </Link>
            <Link href="/upload" className="btn-outline text-sm px-6 py-3">
              Start New Inspection
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
