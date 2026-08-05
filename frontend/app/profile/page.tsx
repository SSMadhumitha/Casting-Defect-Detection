"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { API_BASE, getToken, authFetch } from "@/lib/auth";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineBadgeCheck,
  HiOutlineLockClosed,
  HiOutlineCog,
  HiOutlineServer,
  HiOutlineCheck,
  HiOutlineSave,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
} from "react-icons/hi";

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState("inspector@castingai.com");
  const [fullName, setFullName] = useState("Inspector Account");
  const [userRole, setUserRole] = useState("Chief Quality Engineer");
  const [plantId, setPlantId] = useState("Plant-04 (Metallics)");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // Preferences
  const [autoExportPdf, setAutoExportPdf] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  // System Health state
  const [healthStatus, setHealthStatus] = useState<{ status: string; latency: number; time: string } | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    // Retrieve user details from /auth/me
    const token = getToken();
    if (token) {
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((u) => {
          if (u.email) setUserEmail(u.email);
          if (u.full_name) setFullName(u.full_name);
          if (u.role) setUserRole(u.role);
        })
        .catch(() => {});
    }
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealthLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const end = performance.now();
      if (res.ok) {
        setHealthStatus({
          status: "Operational",
          latency: Math.round(end - start),
          time: new Date().toLocaleTimeString(),
        });
      } else {
        setHealthStatus({ status: "Degraded", latency: Math.round(end - start), time: new Date().toLocaleTimeString() });
      }
    } catch (err) {
      setHealthStatus({ status: "Offline", latency: 0, time: new Date().toLocaleTimeString() });
    } finally {
      setHealthLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setPassMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setPassLoading(true);
    try {
      // Call password update API endpoint or reset endpoint
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, code: "DIRECT", new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassMsg({ type: "success", text: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPassMsg({ type: "error", text: data.detail || "Failed to update password." });
      }
    } catch (err) {
      setPassMsg({ type: "error", text: "Network error while updating password." });
    } finally {
      setPassLoading(false);
    }
  };

  const savePreferences = () => {
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  };

  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-content">
        <main className="page-main">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
                👤 Account & System
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Inspector Profile & Settings</h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage your credentials, inspection preferences, and system diagnostic status.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={checkHealth}
                className="btn-outline text-xs px-4 py-2.5 flex items-center gap-2"
                disabled={healthLoading}
              >
                <HiOutlineRefresh className={healthLoading ? "animate-spin text-cyan-400" : "text-cyan-400"} />
                <span>Ping Server</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: User Card & System Health */}
            <div className="space-y-6">
              {/* User Identity Card */}
              <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 text-center relative overflow-hidden">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/40 text-cyan-400 text-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/10">
                  <HiOutlineUser />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">{fullName}</h2>
                <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                  <span>🔒 {userRole}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">Permanent Designation (Locked)</p>
                <p className="text-xs text-slate-400 font-mono mt-2">{userEmail}</p>

                <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Certification:</span>
                    <span className="text-cyan-400 font-bold">ASNT Level III NDT</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Facility / Plant:</span>
                    <span className="text-slate-200 font-semibold">{plantId}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Account Status:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                      Active Inspector
                    </span>
                  </div>
                </div>
              </div>

              {/* System Health Diagnostics */}
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HiOutlineServer className="text-cyan-400 text-lg" />
                    API Server Health
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">FastAPI Gateway:</span>
                    <span className="font-bold text-emerald-400">{healthStatus?.status || "Connected"}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">Response Latency:</span>
                    <span className="font-mono text-cyan-400">{healthStatus ? `${healthStatus.latency} ms` : "Calculating..."}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400">AI Model Engine:</span>
                    <span className="font-mono text-purple-400">YOLOv8 + U-Net v2.4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Security & Password Update */}
            <div className="lg:col-span-2 space-y-6">
              {/* Password Change Form */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                  <HiOutlineLockClosed className="text-cyan-400" />
                  Security & Password Update
                </h3>
                <p className="text-xs text-slate-400 mb-6">Update your account login password.</p>

                {passMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs mb-4 ${
                      passMsg.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border border-red-500/30 text-red-400"
                    }`}
                  >
                    {passMsg.text}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Email</label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passLoading}
                    className="btn-cyan text-xs px-6 py-3 font-bold"
                  >
                    {passLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
