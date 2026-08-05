"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE, setToken, isValidGmail } from "@/lib/auth";
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowRight } from "react-icons/hi";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Chief Quality Engineer");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidGmail(email)) { setError("Invalid Email: Only valid Gmail accounts (@gmail.com) are permitted."); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      setToken(data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="bg-dots" />

      <div className="w-full max-w-md z-10">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-3xl mb-4 shadow-lg shadow-cyan-500/10">
            ⚙️
          </div>
          <h1 className="text-3xl font-black text-cyan-400 glow-text tracking-tight">CastingAI</h1>
          <p className="text-slate-400 mt-1.5 text-sm font-medium">Create your AI inspection account</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-2xl shadow-2xl relative border border-cyan-500/20">
          <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
          <p className="text-slate-400 text-xs mb-6">Enter your details to create an account</p>

          {error && (
            <div className="error-alert mb-5 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  <HiOutlineUser />
                </span>
                <input
                  type="text"
                  className="input-field pl-11"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  id="register-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  <HiOutlineMail />
                </span>
                <input
                  type="email"
                  className="input-field pl-11"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="register-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Designation / Role</label>
              <select
                className="input-field cursor-pointer bg-slate-900 text-white border border-slate-700"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                id="register-role"
              >
                <option value="Chief Quality Engineer">Chief Quality Engineer</option>
                <option value="Chief Quality Inspector">Chief Quality Inspector</option>
                <option value="Quality Engineer">Quality Engineer</option>
                <option value="Quality Inspector">Quality Inspector</option>
                <option value="Engineer">Engineer</option>
                <option value="Inspector">Inspector</option>
              </select>
              <p className="text-[10px] text-cyan-400/80 mt-1.5 font-mono">
                📌 Note: Your designation will be designated once and permanently locked to your account upon creation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  <HiOutlineLockClosed />
                </span>
                <input
                  type="password"
                  className="input-field pl-11"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id="register-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  <HiOutlineLockClosed />
                </span>
                <input
                  type="password"
                  className="input-field pl-11"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  id="register-confirm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-cyan w-full text-base py-3.5 mt-2 flex items-center justify-center gap-2 font-bold"
              disabled={loading}
              id="register-btn"
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <HiOutlineArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
