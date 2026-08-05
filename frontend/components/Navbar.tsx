"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { removeToken } from "@/lib/auth";
import {
  HiOutlineHome,
  HiOutlineCloudUpload,
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineDocumentText,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineBookOpen,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
} from "react-icons/hi";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
  { href: "/upload", label: "Upload", icon: HiOutlineCloudUpload },
  { href: "/results", label: "Results", icon: HiOutlineChartBar },
  { href: "/analytics", label: "Analytics", icon: HiOutlineChartPie },
  { href: "/reports", label: "Reports", icon: HiOutlineDocumentText },
  { href: "/defects", label: "Defects Guide", icon: HiOutlineBookOpen },
  { href: "/profile", label: "Profile & Settings", icon: HiOutlineUser },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, type: "system", title: "API Server Online", time: "Just now", desc: "FastAPI inference engine running on GPU." },
    { id: 2, type: "alert", title: "ASTM E155 Updated", time: "2h ago", desc: "Defect evaluation rules loaded." },
    { id: 3, type: "info", title: "Daily Scan Report Ready", time: "5h ago", desc: "View analytics summary in Reports tab." },
  ]);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const clearNotifs = () => setNotifications([]);

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="hamburger" onClick={() => setMobileOpen(true)}>
          <HiOutlineMenu />
        </button>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ fontSize: 20 }}>⚙️</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: "var(--cyan)", letterSpacing: "-0.5px" }}>CastingAI</span>
        </Link>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          style={{ background: "none", border: "none", color: "#06b6d4", fontSize: 22, cursor: "pointer" }}
        >
          <HiOutlineBell />
        </button>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              width: "100%",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(168,85,247,0.1))",
                border: "1px solid rgba(6,182,212,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              ⚙️
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--cyan)", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                CastingAI
              </div>
              <div style={{ fontSize: 10, color: "var(--dim)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                AI Platform
              </div>
            </div>
          </Link>

          {/* Bell Notifications Toggle */}
          <div className="relative ml-auto hidden md:block">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-9 h-9 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-cyan-400 flex items-center justify-center hover:border-cyan-500/50 transition-colors relative"
            >
              <HiOutlineBell className="text-lg" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Mobile close */}
          <button
            className="hamburger"
            onClick={() => setMobileOpen(false)}
            style={{ display: mobileOpen ? "flex" : "none", marginLeft: "auto" }}
          >
            <HiOutlineX />
          </button>
        </div>

        {/* Smart Notifications Drawer Overlay */}
        {notifOpen && (
          <div className="p-3 mx-3 my-2 rounded-2xl bg-slate-950/95 border border-cyan-500/30 text-xs shadow-2xl space-y-2 z-50">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <HiOutlineBell className="text-cyan-400" /> Notifications ({notifications.length})
              </span>
              {notifications.length > 0 && (
                <button onClick={clearNotifs} className="text-[10px] text-slate-400 hover:text-cyan-400">
                  Clear All
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-slate-500 text-[11px] text-center py-3">No new notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center justify-between text-white font-semibold text-[11px]">
                    <span>{n.title}</span>
                    <span className="text-[9px] text-slate-500">{n.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{n.desc}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.5rem 1rem 0.5rem", marginBottom: "0.25rem" }}>
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="sidebar-link-icon">
                  <Icon />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{
              width: "100%",
              color: "var(--red)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            <span className="sidebar-link-icon">
              <HiOutlineLogout />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
