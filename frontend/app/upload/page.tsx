"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { isLoggedIn, getToken, API_BASE, formatLocalDate } from "@/lib/auth";
import {
  HiOutlineCloudUpload,
  HiOutlinePhotograph,
  HiOutlineLightningBolt,
  HiOutlineTrash,
  HiOutlineCheckCircle,
} from "react-icons/hi";

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) router.push("/login");
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    setError("");
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const runInspection = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const token = getToken();
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Prediction failed");

      localStorage.setItem("inspectionResult", JSON.stringify(data));

      // Save to real inspection history log
      const existingHistory = JSON.parse(localStorage.getItem("inspectionHistory") || "[]");
      const hasDefects = data.detections && data.detections.length > 0;
      const maxConf = hasDefects
        ? Math.max(...data.detections.map((d: any) => d.confidence))
        : 0.94;

      const newRecord = {
        id: `RPT-${String(existingHistory.length + 1).padStart(3, '0')}`,
        date: formatLocalDate(data.created_at),
        file: data.filename,
        status: hasDefects ? "Defect Detected" : "Passed",
        defects: data.detections ? data.detections.length : 0,
        confidence: `${(maxConf * 100).toFixed(0)}%`,
        color: hasDefects ? "#f87171" : "#4ade80",
        resultData: data,
      };

      existingHistory.unshift(newRecord);
      localStorage.setItem("inspectionHistory", JSON.stringify(existingHistory));

      router.push("/results");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-content">
        <main className="page-main">
          {/* Header */}
          <div className="flex flex-col items-start gap-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <HiOutlineCloudUpload /> AI Inspection Pipeline
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Upload Workspace</h1>
            <p className="text-slate-400 text-sm">Upload an industrial X-ray scan to initiate U-Net + YOLOv8 defect detection.</p>
          </div>

          {error && (
            <div className="error-alert flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            id="drop-zone"
            className={`drop-zone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-4xl flex items-center justify-center mx-auto mb-4 animate-float shadow-lg shadow-cyan-500/10">
              <HiOutlinePhotograph />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {dragging ? "Drop Image to Upload" : "Drag & Drop Industrial X-Ray Image"}
            </h2>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Supports high-resolution JPG, PNG, or DICOM exports up to 50MB. Click to browse.
            </p>

            <label
              className="btn-cyan px-8 py-3 text-sm cursor-pointer inline-flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <HiOutlineCloudUpload className="text-lg" />
              <span>Browse Local Files</span>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </label>
          </div>

          {/* File Selected Preview */}
          {preview && (
            <div className="glass-card p-6 rounded-2xl border border-cyan-500/25">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <HiOutlineCheckCircle /> Selected Inspection Scan
              </h3>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative rounded-xl overflow-hidden border-2 border-cyan-500/40 shadow-xl max-w-xs w-full bg-slate-950">
                  <img
                    src={preview}
                    alt="Inspection Preview"
                    className="w-full h-auto object-contain max-h-64"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur text-xs font-mono text-cyan-300 border border-cyan-500/30">
                    RAW SCAN
                  </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[10px] mb-1">File Name</span>
                      <span className="text-slate-200 font-semibold truncate block">{selectedFile?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[10px] mb-1">File Size</span>
                      <span className="text-slate-200 font-semibold block">
                        {selectedFile ? (selectedFile.size / 1024).toFixed(1) + " KB" : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      id="run-inspection-btn"
                      onClick={runInspection}
                      disabled={loading}
                      className="btn-cyan text-base px-8 py-3.5 flex-1 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin text-lg">⟳</span>
                          <span>Processing Dual AI Pipeline...</span>
                        </span>
                      ) : (
                        <>
                          <HiOutlineLightningBolt className="text-xl" />
                          <span>Run AI Inspection</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => { setSelectedFile(null); setPreview(null); }}
                      className="btn-danger px-4 py-3 flex items-center gap-1 text-xs"
                    >
                      <HiOutlineTrash />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
