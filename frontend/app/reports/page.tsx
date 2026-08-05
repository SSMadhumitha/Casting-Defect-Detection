"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { isLoggedIn, authFetch, formatLocalDate } from "@/lib/auth";
import {
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineEye,
} from "react-icons/hi";

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // User & Daily Sign-off state
  const [user, setUser] = useState<any>(null);
  const [signoffData, setSignoffData] = useState<any>(null);
  const [remarksInput, setRemarksInput] = useState("All X-Ray scans for today verified according to ASTM E155 NDT standards.");
  const [signoffLoading, setSignoffLoading] = useState(false);
  const [signoffMsg, setSignoffMsg] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login"); return; }

    const initData = async () => {
      // Fetch user profile
      try {
        const uRes = await authFetch("/auth/me");
        if (uRes.ok) {
          const uData = await uRes.json();
          setUser(uData);
        }
      } catch (e) {}

      // Fetch today's signoff
      fetchSignoff();

      // Fetch inspections
      let items: any[] = [];
      try {
        const res = await authFetch("/inspections");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            items = data.map((item: any) => ({
              ...item,
              date: formatLocalDate(item.date),
            }));
          }
        }
      } catch (e) {
        console.error("Failed to fetch inspections from backend:", e);
      }

      if (items.length === 0) {
        const history = localStorage.getItem("inspectionHistory");
        const active = localStorage.getItem("inspectionResult");

        if (history) {
          try {
            const parsed = JSON.parse(history);
            if (Array.isArray(parsed) && parsed.length > 0) {
              items = parsed.map((item: any) => ({ ...item, date: formatLocalDate(item.date) }));
            }
          } catch (e) {}
        }

        if (items.length === 0 && active) {
          try {
            const activeData = JSON.parse(active);
            const hasDefects = activeData.detections && activeData.detections.length > 0;
            const maxConf = hasDefects
              ? Math.max(...activeData.detections.map((d: any) => d.confidence))
              : 0;

            items = [{
              id: "RPT-001",
              date: formatLocalDate(activeData.created_at || new Date()),
              file: activeData.filename,
              status: hasDefects ? "Defect Detected" : "Passed",
              defects: activeData.detections ? activeData.detections.length : 0,
              confidence: hasDefects ? `${(maxConf * 100).toFixed(0)}%` : "N/A",
              color: hasDefects ? "#f87171" : "#4ade80",
              resultData: activeData,
            }];
          } catch (e) {}
        }
      }

      setReports(items);
      if (items.length > 0) {
        localStorage.setItem("inspectionHistory", JSON.stringify(items));
      }
    };

    initData();
  }, []);

  const fetchSignoff = async () => {
    try {
      const res = await authFetch("/signoff/today");
      if (res.ok) {
        const sData = await res.json();
        setSignoffData(sData);
      }
    } catch (e) {}
  };

  const handleSignoffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignoffLoading(true);
    setSignoffMsg("");

    try {
      const res = await authFetch("/signoff", {
        method: "POST",
        body: JSON.stringify({ remarks: remarksInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Sign-off failed");
      setSignoffMsg("Daily digital sign-off successfully recorded!");
      fetchSignoff();
    } catch (err: any) {
      setSignoffMsg(`Error: ${err.message}`);
    } finally {
      setSignoffLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await authFetch("/inspections", { method: "DELETE" });
    } catch (e) {
      console.error("Failed to clear inspections on backend:", e);
    }
    localStorage.removeItem("inspectionHistory");
    setReports([]);
  };

  const handleDownload = (report: any) => {
    const content = `=================================================\n` +
      `          CASTING AI - INSPECTION REPORT         \n` +
      `=================================================\n` +
      `Report ID: ${report.id}\n` +
      `Date: ${report.date}\n` +
      `Image File: ${report.file}\n` +
      `Status: ${report.status}\n` +
      `Defects Detected: ${report.defects}\n` +
      `Model Confidence: ${report.confidence}\n` +
      `=================================================\n`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.id}_inspection_report.txt`;
    a.click();
  };

  const openResult = (report: any) => {
    if (report.resultData) {
      localStorage.setItem("inspectionResult", JSON.stringify(report.resultData));
      router.push("/results");
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.file.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "PASSED") return matchesSearch && r.defects === 0;
    if (filterStatus === "DEFECT") return matchesSearch && r.defects > 0;
    return matchesSearch;
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
                Compliance Records
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Inspection Reports & Audit Logs</h1>
              <p className="text-slate-400 text-sm">Download official verification logs and review historic casting evaluations.</p>
            </div>

            <Link href="/upload" className="btn-cyan text-xs px-5 py-3 flex items-center gap-2 shrink-0">
              <HiOutlinePlus className="text-base" />
              <span>New Inspection</span>
            </Link>
          </div>

          {/* Summary Cards Grid */}
          <div className="grid grid-cols-3 gap-4 w-full">
            {[
              { label: "Total Generated Reports", value: reports.length, color: "#06b6d4" },
              { label: "Defect Identified Scans", value: reports.filter((r) => r.defects > 0).length, color: "#f87171" },
              { label: "Verified Pass Scans", value: reports.filter((r) => r.defects === 0).length, color: "#4ade80" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Daily Digital Inspector Sign-Off Section */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 w-full space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  ✍️ Digital Inspector Sign-Off & Remarks
                </div>
                <h2 className="text-lg font-bold text-white">Daily Inspection Approval & Authentication</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Single daily sign-off applies to all verification reports generated on this date.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono block">DATE OF RECORD</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">{signoffData?.date || formatLocalDate()}</span>
              </div>
            </div>

            {signoffData?.signed ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                    <span>✅ DIGITALLY SIGNED & APPROVED FOR TODAY</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] text-emerald-300 font-mono">
                      {signoffData.signed_by_role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">
                    <span className="text-slate-400">Signatory:</span> <strong className="text-white">{signoffData.signed_by_name}</strong> ({signoffData.signed_by_email})
                  </p>
                  <p className="text-xs text-slate-300 italic mt-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    &ldquo;{signoffData.remarks || "Verified according to ASTM E155 NDT standards."}&rdquo;
                  </p>
                </div>
                <span className="text-[11px] text-emerald-400/80 font-mono shrink-0">
                  Stamp ID: DS-{signoffData.date.replace(/-/g, "")}
                </span>
              </div>
            ) : (user?.role || "").trim().toLowerCase() === "chief quality engineer" ? (
              <form onSubmit={handleSignoffSubmit} className="space-y-3 pt-2">
                {signoffMsg && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${signoffMsg.startsWith("Error") ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"}`}>
                    {signoffMsg}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Chief Quality Engineer Remarks
                  </label>
                  <textarea
                    rows={2}
                    className="input-field text-xs resize-none"
                    placeholder="Enter official sign-off remarks..."
                    value={remarksInput}
                    onChange={(e) => setRemarksInput(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400 flex items-center gap-1 font-medium">
                    ⚠️ Signing will authenticate all reports generated today as Chief Quality Engineer ({user?.full_name || "Chief Quality Engineer"}).
                  </span>
                  <button
                    type="submit"
                    disabled={signoffLoading}
                    className="btn-cyan text-xs px-6 py-2.5 font-bold flex items-center gap-2"
                  >
                    <span>✍️ Sign Off All Reports For Today</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <div className="text-slate-200 font-bold mb-0.5">Daily Sign-Off Pending Authorization</div>
                  <div>Only an authorized <span className="text-cyan-400 font-bold">Chief Quality Engineer</span> is permitted to digitally sign off daily inspection reports.</div>
                </div>
              </div>
            )}
          </div>

          {/* Reports Table Container */}
          <div className="glass-panel rounded-2xl overflow-hidden w-full border border-cyan-500/15">
            {/* Table Controls Header */}
            <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-72">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <HiOutlineSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search by ID or file..."
                  className="input-field pl-10 text-xs py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="flex gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
                  {["ALL", "PASSED", "DEFECT"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-colors ${
                        filterStatus === st
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {reports.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <HiOutlineTrash />
                    <span>Clear Logs</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table Content */}
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 text-3xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                  <HiOutlineDocumentText />
                </div>
                <p className="text-slate-300 font-bold mb-1">No matching inspection reports</p>
                <p className="text-slate-500 text-xs mb-6">Process a scan in the Upload workspace to log records here.</p>
                <Link href="/upload" className="btn-cyan text-xs px-6 py-2.5">
                  Upload Scan
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Date</th>
                      <th>Image File</th>
                      <th>Status</th>
                      <th>Defects</th>
                      <th>Confidence</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((r, i) => (
                      <tr key={i}>
                        <td className="text-cyan-400 font-mono font-bold text-xs">{r.id}</td>
                        <td className="text-slate-400 text-xs">{r.date}</td>
                        <td
                          className="text-slate-200 font-medium text-xs cursor-pointer hover:text-cyan-400 transition-colors"
                          onClick={() => openResult(r)}
                        >
                          <span className="flex items-center gap-1">
                            <span>{r.file}</span>
                            <HiOutlineEye className="text-slate-500 text-sm" />
                          </span>
                        </td>
                        <td>
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                            style={{ background: `${r.color}15`, color: r.color, border: `1px solid ${r.color}30` }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
                            {r.status}
                          </span>
                        </td>
                        <td className="font-mono text-xs font-bold" style={{ color: r.defects > 0 ? "#f87171" : "#4ade80" }}>
                          {r.defects}
                        </td>
                        <td className="text-amber-400 font-mono font-bold text-xs">{r.confidence}</td>
                        <td>
                          <button
                            onClick={() => handleDownload(r)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20"
                          >
                            <HiOutlineDownload />
                            <span>Report TXT</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
