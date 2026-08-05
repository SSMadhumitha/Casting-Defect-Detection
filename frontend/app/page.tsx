"use client";
import Link from "next/link";
import { useState } from "react";
import {
  HiOutlineBeaker,
  HiOutlineEye,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineLightningBolt,
  HiOutlineClock,
  HiOutlineShieldCheck,
} from "react-icons/hi";

const features = [
  { icon: HiOutlineBeaker, title: "U-Net Enhancement", desc: "Deep learning noise removal and X-ray resolution enhancement.", color: "#06b6d4", href: "/upload" },
  { icon: HiOutlineEye, title: "YOLO Detection", desc: "Computer vision pipeline that pinpoints and classifies casting defects.", color: "#f87171", href: "/results" },
  { icon: HiOutlineChartBar, title: "Live Analytics", desc: "Real-time dashboards with confidence scores and pass/fail ratios.", color: "#fbbf24", href: "/analytics" },
  { icon: HiOutlineDocumentText, title: "PDF Reports", desc: "One-click standardized inspection reports for compliance records.", color: "#4ade80", href: "/reports" },
];

const workflow = [
  { label: "Upload X-Ray", href: "/upload" },
  { label: "U-Net Filter", href: "/upload" },
  { label: "YOLO Analysis", href: "/results" },
  { label: "View Results", href: "/results" },
  { label: "Download Report", href: "/reports" },
];

const metrics = [
  { value: "96%+", label: "Accuracy", color: "#06b6d4", icon: HiOutlineShieldCheck },
  { value: "< 3.5s", label: "Speed", color: "#4ade80", icon: HiOutlineLightningBolt },
  { value: "2", label: "AI Models", color: "#fbbf24", icon: HiOutlineSparkles },
  { value: "24/7", label: "Availability", color: "#a855f7", icon: HiOutlineClock },
];

function FeatureCard({ f }: { f: typeof features[0] }) {
  const [hovered, setHovered] = useState(false);
  const Icon = f.icon;
  return (
    <Link href={f.href} style={{ display: "block", textDecoration: "none" }}>
      <div
        className="glass"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: "2.25rem 2rem",
          borderRadius: "var(--radius-lg)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 16,
          cursor: "pointer",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          boxShadow: hovered ? `0 16px 48px ${f.color}18` : "none",
          borderColor: hovered ? `${f.color}40` : undefined,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: `${f.color}12`,
            border: `1px solid ${f.color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: f.color,
            fontSize: 24,
          }}
        >
          <Icon />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{f.title}</h3>
        <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.7, flex: 1 }}>{f.desc}</p>
        <div
          style={{
            marginTop: "auto",
            fontSize: 12,
            fontWeight: 700,
            color: f.color,
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "gap 0.18s",
          }}
        >
          Open Module <HiOutlineArrowRight style={{ fontSize: 14 }} />
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", width: "100%" }} className="gradient-bg">
      {/* Background decoration */}
      <div className="bg-dots" />

      {/* NAVBAR */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(5,8,16,0.9)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(168,85,247,0.1))",
                border: "1px solid rgba(6,182,212,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              ⚙️
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }} className="gradient-text-cyan">
              CastingAI
            </span>
          </Link>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/login" className="btn-outline" style={{ fontSize: 13.5, padding: "0.55rem 1.25rem" }}>
              Sign In
            </Link>
            <Link href="/register" className="btn-cyan" style={{ fontSize: 13.5, padding: "0.55rem 1.25rem" }}>
              Get Started <HiOutlineArrowRight />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "7rem 2rem 4rem",
          maxWidth: 900,
          margin: "0 auto",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="badge badge-cyan badge-pulse" style={{ marginBottom: "2rem", paddingLeft: "1.1rem" }}>
          <HiOutlineSparkles style={{ fontSize: 12 }} /> Industrial AI Inspection Platform
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 5.5vw, 4.2rem)",
            fontWeight: 900,
            lineHeight: 1.12,
            marginBottom: "1.75rem",
            color: "#fff",
            letterSpacing: "-1px",
          }}
        >
          Automated Defect Detection
          <br />
          <span className="gradient-text" style={{ WebkitTextFillColor: "transparent" }}>
            for Industrial Castings
          </span>
        </h1>

        <p style={{ fontSize: "1.15rem", color: "var(--muted)", maxWidth: 620, margin: "0 auto 2.75rem", lineHeight: 1.8, fontWeight: 400 }}>
          Upload X-ray scans and identify structural flaws in seconds using dual-stage deep learning: U-Net enhancement + YOLOv8 detection.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/upload" className="btn-cyan" style={{ fontSize: 15.5, padding: "1rem 2.25rem" }}>
            <HiOutlineLightningBolt /> Start Inspection
          </Link>
          <Link href="/dashboard" className="btn-outline" style={{ fontSize: 15.5, padding: "1rem 2.25rem" }}>
            Go to Dashboard <HiOutlineArrowRight />
          </Link>
        </div>
      </section>

      {/* PIPELINE SECTION */}
      <section style={{ padding: "0 2rem 5rem", maxWidth: 950, margin: "0 auto", width: "100%", display: "flex", justifyContent: "center" }}>
        <div className="glass-panel" style={{ padding: "1.75rem 2.25rem", width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cyan)", marginBottom: "1.25rem" }}>
            AI Inspection Pipeline — click any step to navigate
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", alignItems: "center" }}>
            {workflow.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Link
                  href={step.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0.5rem 1.15rem",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(6,182,212,0.06)",
                    border: "1px solid rgba(6,182,212,0.2)",
                    color: "var(--cyan)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.18s",
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "monospace", opacity: 0.6 }}>
                    0{i + 1}
                  </span>
                  {step.label}
                </Link>
                {i < workflow.length - 1 && (
                  <span style={{ color: "var(--dim)", fontSize: 12 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE CARDS SECTION */}
      <section
        style={{
          padding: "5rem 2rem",
          width: "100%",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 2.5rem)",
                fontWeight: 800,
                color: "#fff",
                marginBottom: "0.85rem",
                letterSpacing: "-0.5px",
              }}
            >
              Engineered for High-Precision Manufacturing
            </h2>
            <p style={{ color: "var(--muted)", maxWidth: 500, margin: "0 auto", fontSize: 14.5 }}>
              Click any module to open its workspace directly.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {features.map((f, i) => (
              <FeatureCard key={i} f={f} />
            ))}
          </div>
        </div>
      </section>

      {/* METRICS SECTION */}
      <section style={{ padding: "5rem 2rem", maxWidth: 1050, margin: "0 auto", width: "100%" }}>
        <div className="glass-panel" style={{ padding: "3rem 2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32 }}>
            {metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Icon style={{ fontSize: 24, color: m.color, marginBottom: 4, opacity: 0.7 }} />
                  <div style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, color: m.color }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", fontWeight: 700 }}>
                    {m.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ textAlign: "center", padding: "5rem 2rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 650, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.6rem)", fontWeight: 800, color: "#fff", marginBottom: "1.1rem", letterSpacing: "-0.5px" }}>
            Start Your First Inspection Now
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: "2.5rem", fontSize: 15, lineHeight: 1.7 }}>
            Create an account, upload your X-ray image, and receive real-time inspection results in seconds.
          </p>
          <Link href="/register" className="btn-cyan" style={{ fontSize: 16, padding: "1rem 2.75rem" }}>
            Create Free Account <HiOutlineArrowRight />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          padding: "1.75rem",
          textAlign: "center",
          color: "var(--dim)",
          fontSize: 12.5,
          marginTop: "auto",
        }}
      >
        © {new Date().getFullYear()} CastingAI Platform. All rights reserved.
      </footer>
    </div>
  );
}
