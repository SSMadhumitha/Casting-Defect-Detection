import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CastingAI – Industrial Defect Detection",
  description: "AI-powered X-ray casting defect detection using YOLO and U-Net models.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#050810" />
      </head>
      <body className="gradient-bg min-h-screen">{children}</body>
    </html>
  );
}
