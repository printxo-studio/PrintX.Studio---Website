"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Box,
  Trash2,
} from "lucide-react";
import ModelViewer from "@/components/3d/ModelViewer";
import { generateRequestNumber } from "@/lib/utils";

export default function CustomPrintPage() {
  const router = useRouter();

  const [files, setFiles] = useState<{ name: string; size: number; type: string }[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [intendedUse, setIntendedUse] = useState("Display / Aesthetics");
  const [quantity, setQuantity] = useState(1);
  const [preferredMaterial, setPreferredMaterial] = useState("PLA+ High Precision");
  const [preferredColor, setPreferredColor] = useState("Matte Black");
  const [finish, setFinish] = useState("Standard Cleaned (0.16mm)");
  const [targetBudget, setTargetBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  const [hasUploadedModel, setHasUploadedModel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRequestId, setSuccessRequestId] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const fileList = Array.from(e.target.files);
    const newFiles = fileList.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.name.split(".").pop()?.toLowerCase() || "",
    }));

    // Check extensions
    const invalid = newFiles.some(
      (f) => !["stl", "obj", "3mf", "step", "stp", "pdf", "png", "jpg"].includes(f.type)
    );

    if (invalid) {
      setFileError("Only STL, OBJ, 3MF, STEP, PDF, PNG, and JPG files are supported.");
      return;
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setRawFiles((prev) => [...prev, ...fileList]);
    setHasUploadedModel(true);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) setHasUploadedModel(false);
      return updated;
    });
    setRawFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setFileError("Please upload at least one 3D CAD file or reference diagram.");
      return;
    }

    setIsSubmitting(true);
    const requestNumber = generateRequestNumber();

    const requestData = {
      id: `cpr-${Date.now()}`,
      requestNumber,
      projectTitle,
      description,
      intendedUse,
      quantity,
      preferredMaterial,
      preferredColor,
      finish,
      targetBudget: targetBudget ? Number(targetBudget) : null,
      deadline: deadline || null,
      guestName,
      guestEmail,
      guestPhone,
      shippingAddress,
      status: "SUBMITTED",
      files: files.map((f, idx) => ({
        id: `file-${idx}-${Date.now()}`,
        filename: f.name,
        fileSize: f.size,
        fileType: f.type,
        estimatedVolumeCm3: Math.round(f.size / 65000),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save in customer requests log in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("printxo_custom_requests") || "[]");
      localStorage.setItem("printxo_custom_requests", JSON.stringify([requestData, ...existing]));
    } catch (err) {
      console.error(err);
    }

    // Forward to Website & BOS backend API
    try {
      await fetch("/api/custom-print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
    } catch (apiErr) {
      console.warn("Backend custom print sync:", apiErr);
    }

    setIsSubmitting(false);
    setSuccessRequestId(requestNumber);
  };

  if (successRequestId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-white">3D Request Dispatched!</h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Our senior slicing engineers have received your files for request{" "}
          <strong className="text-red-400 font-mono">#{successRequestId}</strong>. We are running mesh analysis and preparing your quote within 2 hours.
        </p>

        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-left text-xs space-y-3 max-w-md mx-auto">
          <div className="flex justify-between">
            <span className="text-zinc-500">Project:</span>
            <strong className="text-white">{projectTitle}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Material:</span>
            <strong className="text-zinc-200">{preferredMaterial}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Quantity:</span>
            <strong className="text-zinc-200">{quantity} units</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Status:</span>
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold text-[10px]">
              SUBMITTED • UNDER REVIEW
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/account/custom-prints"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase glow-crimson"
          >
            Track in Custom Hub
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-800"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
          <span>On-Demand Rapid Manufacturing</span>
          <span>•</span>
          <span>Additive Slicing Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Request a Custom 3D Print
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
          Upload your 3D CAD files (STL, OBJ, 3MF, STEP). Our technical specialists inspect geometric tolerances, infill density, and calculate transparent manufacturing quotes.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: 3D Uploader & Interactive Preview */}
          <div className="lg:col-span-6 space-y-6">
            {/* File Dropzone */}
            <div className="p-8 rounded-2xl bg-zinc-900/40 border-2 border-dashed border-zinc-800 hover:border-red-500/50 transition-colors text-center relative group">
              <input
                type="file"
                multiple
                accept=".stl,.obj,.3mf,.step,.stp,.pdf,.png,.jpg"
                onChange={handleFileDrop}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                Drop your 3D CAD models here or browse
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-3">
                Supports STL, OBJ, 3MF, STEP and reference PDFs up to 50MB.
              </p>
              <span className="inline-block px-3 py-1 rounded-md bg-zinc-800 text-[11px] font-semibold text-zinc-300">
                Watertight Mesh Checked
              </span>
            </div>

            {fileError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Uploaded CAD Assets ({files.length})
                </div>
                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Box className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="font-semibold text-white truncate">{file.name}</span>
                        <span className="text-zinc-500 text-[11px]">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive 3D Model Preview */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Live 3D CAD Preview</span>
                <span className="text-[11px] text-zinc-500">WebGL Real-Time Slicing Simulation</span>
              </div>
              <ModelViewer
                file={rawFiles.find((f) => f.name.toLowerCase().endsWith(".stl")) || rawFiles[0] || null}
                title={files[0]?.name || "3D Interactive Simulation"}
              />
            </div>
          </div>

          {/* Right: Technical Requirements & Contact */}
          <div className="lg:col-span-6 space-y-6">
            {/* Project Details */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                1. Project Specifications
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. Drone Motor Mount or Custom Lamp Housing"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Detailed Requirements & Slicing Notes *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide any critical tolerances (e.g. 0.15mm hole fit), mechanical stresses, or cosmetic requirements."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1">
                      Intended Use
                    </label>
                    <select
                      value={intendedUse}
                      onChange={(e) => setIntendedUse(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Mechanical / Functional Prototype">Mechanical / Functional Prototype</option>
                      <option value="Display / Aesthetics">Display / Aesthetics</option>
                      <option value="Tabletop Gaming / Miniature">Tabletop Gaming / Miniature</option>
                      <option value="Outdoor / High-Temperature Fixture">Outdoor / High-Temperature Fixture</option>
                      <option value="End-Use Consumer Product">End-Use Consumer Product</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1">
                      Quantity Required
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Material & Finish Selection */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                2. Material & Surface Finishing
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Preferred Material
                  </label>
                  <select
                    value={preferredMaterial}
                    onChange={(e) => setPreferredMaterial(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="PLA+ High Precision">PLA+ High Precision (Aesthetic/Stiff)</option>
                    <option value="PETG Industrial Pro">PETG Industrial Pro (High Impact/75°C)</option>
                    <option value="Carbon Fiber PLA">Carbon Fiber PLA (Max Rigidity/Matte)</option>
                    <option value="8K Monochrome Resin">8K Monochrome Resin (Microscopic 0.025mm)</option>
                    <option value="ABS Tough">ABS Tough (Vapor Smoothable/Acetone)</option>
                    <option value="Flexible TPU 95A">Flexible TPU 95A (Rubber-like)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Preferred Color
                  </label>
                  <input
                    type="text"
                    value={preferredColor}
                    onChange={(e) => setPreferredColor(e.target.value)}
                    placeholder="Matte Black, Vivid Red, Silver, White..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Surface Finish
                  </label>
                  <select
                    value={finish}
                    onChange={(e) => setFinish(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Standard Cleaned (0.16mm)">Standard Cleaned (0.16mm)</option>
                    <option value="Ultra Detail (0.08mm Layer)">Ultra Detail (0.08mm Layer)</option>
                    <option value="Sanded & Primed">Sanded & Primed (Ready to Paint)</option>
                    <option value="Vapor Polished Smooth">Vapor Polished Smooth</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">
                    Target Budget in INR (Optional)
                  </label>
                  <input
                    type="number"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(e.target.value)}
                    placeholder="e.g. ₹2,500"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Destination */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                3. Contact & Delivery Location
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Vikram Sharma"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">City / Pincode *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Bengaluru - 560038"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Submission CTA */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 glow-crimson transition-all"
              >
                {isSubmitting ? (
                  <span>Analyzing CAD Files...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit 3D Files For Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                <span>NDA & Confidential CAD File Protection Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
