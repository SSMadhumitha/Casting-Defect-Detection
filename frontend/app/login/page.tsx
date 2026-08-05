"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE, setToken, isValidGmail } from "@/lib/auth";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowRight, HiOutlineX, HiOutlineCheckCircle, HiOutlineKey } from "react-icons/hi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "code" | "success">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidGmail(email)) {
      setError("Invalid Email: Only valid Gmail accounts (@gmail.com) are permitted to sign in.");
      return;
    }

    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");

      setToken(data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Request failed");

      setResetCode(""); // Keep input empty so user enters code from email
      setForgotStep("code");
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: resetCode.trim(),
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed");

      setForgotStep("success");
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
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
          <p className="text-slate-400 mt-1.5 text-sm font-medium">Industrial Defect Detection Platform</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-2xl shadow-2xl relative border border-cyan-500/20">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-xs mb-6">Enter your credentials to access the AI workspace</p>

          {error && (
            <div className="error-alert mb-5 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
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
                  id="login-email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotStep("email");
                    setForgotError("");
                    setResetCode("");
                    setNewPassword("");
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  <HiOutlineLockClosed />
                </span>
                <input
                  type="password"
                  className="input-field pl-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id="login-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-cyan w-full text-base py-3.5 mt-2 flex items-center justify-center gap-2 font-bold"
              disabled={loading}
              id="login-btn"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <HiOutlineArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-card relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl p-1"
            >
              <HiOutlineX />
            </button>

            {forgotError && (
              <div className="error-alert mb-4 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === "email" && (
              <>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl mb-4">
                  <HiOutlineLockClosed />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                  Enter your registered email address to receive a 6-digit verification code in your email inbox.
                </p>

                <form onSubmit={handleSendForgotCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="you@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-cyan w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Sending Code..." : "Send Verification Code"}
                  </button>
                </form>
              </>
            )}

            {forgotStep === "code" && (
              <>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl mb-4">
                  <HiOutlineKey />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Check Your Email</h3>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                  Verification code sent to <span className="text-cyan-400 font-semibold">{forgotEmail}</span>. Please check your email inbox and enter the code below.
                </p>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      className="input-field font-mono text-center tracking-widest text-lg"
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-cyan w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Resetting Password..." : "Confirm & Update Password"}
                  </button>
                </form>
              </>
            )}

            {forgotStep === "success" && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <HiOutlineCheckCircle />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Password Reset Successful</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Your password has been updated! You can now log in using your new credentials.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setPassword("");
                  }}
                  className="btn-cyan w-full py-3 text-sm font-bold"
                >
                  Return to Login & Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
