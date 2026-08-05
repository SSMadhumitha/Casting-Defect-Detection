"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { isLoggedIn, authFetch } from "@/lib/auth";
import {
  HiOutlineCloudUpload,
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
} from "react-icons/hi";

const navCards = [
  { href: "/upload", icon: HiOutlineCloudUpload, label: "Upload Inspection", sub: "Start a new AI inspection", color: "#06b6d4", glow: "rgba(6,182,212,0.15)" },
  { href: "/results", icon: HiOutlineChartBar, label: "Results Workspace", sub: "View inspection results", color: "#f87171", glow: "rgba(248,113,113,0.15)" },
  { href: "/analytics", icon: HiOutlineChartPie, label: "Analytics & Trends", sub: "View AI analytics & trends", color: "#fbbf24", glow: "rgba(251,191,36,0.15)" },
  { href: "/reports", icon: HiOutlineDocumentText, label: "Reports & Logs", sub: "Download PDF reports", color: "#4ade80", glow: "rgba(74,222,128,0.15)" },
];

const workflowSteps = [
  { icon: "📤", label: "Upload X-Ray", color: "#06b6d4" },
  { icon: "🧠", label: "U-Net Enhancement", color: "#a855f7" },
  { icon: "🎯", label: "YOLO Detection", color: "#f87171" },
  { icon: "📊", label: "Live Analytics", color: "#fbbf24" },
  { icon: "📄", label: "PDF Report", color: "#4ade80" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<{
    total_inspections: number;
    defects_detected: number;
    pass_rate: number;
    avg_confidence: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login"); return; }

    const loadData = () => {
      Promise.all([
        authFetch("/auth/me").then((r) => r.json()),
        authFetch("/stats").then((r) => r.json()),
      ])
        .then(([userData, statsData]) => {
          setUser(userData);
          setStats(statsData);
        })
        .catch(() => router.push("/login"))
        .finally(() => setLoading(false));
    };

    loadData();
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, []);

  const statCards = stats
    ? [
        { label: "Total Inspections", value: String(stats.total_inspections), color: "#06b6d4", icon: HiOutlineCloudUpload },
        { label: "Defects Detected",  value: String(stats.defects_detected),  color: "#f87171", icon: HiOutlineExclamationCircle },
        { label: "Pass Rate",         value: `${stats.pass_rate}%`,           color: "#4ade80", icon: HiOutlineCheckCircle },
        { label: "Avg Confidence",    value: `${stats.avg_confidence}%`,      color: "#fbbf24", icon: HiOutlineSparkles },
      ]
    : [];

  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-content">
        <main className="page-main">
          {/* Hero Banner */}
          <div className="glass-card relative overflow-hidden p-8 border border-cyan-500/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Industrial AI Operations Active
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  Welcome back{user?.full_name ? `, ${user.full_name}` : ""} 👋
                </h1>
                <p className="text-slate-400 text-sm mt-2 max-w-xl leading-relaxed">
                  Real-time X-Ray defect analysis and dual-stage AI model monitoring. Select a action below or start a new scan.
                </p>
              </div>

              <Link href="/upload" className="btn-cyan text-sm px-6 py-3 shrink-0 flex items-center gap-2">
                <span>🚀 Start New Inspection</span>
                <HiOutlineArrowRight />
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Inspection Metrics</h2>
              <span className="text-xs text-cyan-400 font-medium">Live Telemetry</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="stat-card glass animate-pulse flex flex-col items-center justify-center py-8">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 mb-3" />
                      <div className="h-4 w-20 bg-slate-800 rounded mb-2" />
                      <div className="h-8 w-16 bg-slate-800 rounded" />
                    </div>
                  ))
                : stats?.total_inspections === 0
                ? (
                    <div className="col-span-2 md:col-span-4 glass p-8 rounded-2xl text-center border border-cyan-500/20">
                      <p className="text-slate-400 text-base">
                        No inspections recorded yet.{" "}
                        <Link href="/upload" className="text-cyan-400 font-bold underline underline-offset-4">
                          Upload your first X-Ray image →
                        </Link>
                      </p>
                    </div>
                  )
                : statCards.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="stat-card">
                        <div className="flex justify-center mb-3 text-2xl" style={{ color: s.color }}>
                          <Icon />
                        </div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                        <p className="text-3xl font-black tracking-tight" style={{ color: s.color }}>{s.value}</p>
                      </div>
                    );
                  })
              }
            </div>
          </div>

          {/* Nav Actions Grid */}
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Workspaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {navCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <Link key={i} href={c.href} className="no-underline group">
                    <div
                      className="glass p-6 rounded-2xl cursor-pointer h-full transition-all duration-300 border border-slate-800 group-hover:border-cyan-500/40 relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, rgba(13,17,23,0.8), ${c.glow})` }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                        style={{ background: `${c.color}15`, border: `1px solid ${c.color}30`, color: c.color }}
                      >
                        <Icon />
                      </div>
                      <h3 className="text-lg font-bold mb-1 group-hover:text-cyan-400 transition-colors" style={{ color: c.color }}>
                        {c.label}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed">{c.sub}</p>
                      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">
                        <span>Open module</span>
                        <HiOutlineArrowRight className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* AI Workflow Section */}
          <div className="glass-panel p-8 rounded-2xl w-full border border-cyan-500/15">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-cyan-400"><HiOutlineSparkles /></span>
                  AI Pipeline Flow
                </h2>
                <p className="text-slate-400 text-xs mt-1">Dual-stage deep learning processing pipeline</p>
              </div>
              <span className="badge badge-cyan text-xs">Automated Workflow</span>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-between">
              {workflowSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 flex-1 min-w-[140px]">
                  <div
                    className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold border transition-all hover:scale-105"
                    style={{ background: `${step.color}10`, borderColor: `${step.color}30`, color: step.color }}
                  >
                    <span className="text-base">{step.icon}</span>
                    <span className="whitespace-nowrap">{step.label}</span>
                  </div>
                  {i < workflowSteps.length - 1 && (
                    <span className="text-slate-600 hidden lg:inline">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
