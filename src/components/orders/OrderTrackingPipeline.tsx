"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Layers,
  ShieldCheck,
  MapPin,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface OrderTrackingPipelineProps {
  order: any;
  shipment?: any;
}

export default function OrderTrackingPipeline({ order, shipment }: OrderTrackingPipelineProps) {
  const [showFlowchart, setShowFlowchart] = useState(false);

  // Compute stage index: 0 = Confirmed, 1 = Printing/Production, 2 = Shipped/In Transit, 3 = Delivered
  const isDelivered =
    order.overallStatus === "COMPLETED" ||
    order.shippingStatus === "DELIVERED" ||
    shipment?.status === "DELIVERED";

  const isShipped =
    isDelivered ||
    order.shippingStatus === "SHIPPED" ||
    shipment?.status === "SHIPPED" ||
    shipment?.status === "IN_TRANSIT";

  const isPrinted =
    isShipped ||
    order.productionStatus === "COMPLETED" ||
    order.productionStatus === "IN_PROGRESS";

  let currentStageIndex = 0;
  if (isDelivered) currentStageIndex = 3;
  else if (isShipped) currentStageIndex = 2;
  else if (isPrinted) currentStageIndex = 1;
  else currentStageIndex = 0;

  const stages = [
    {
      id: "confirmed",
      label: "Order Confirmed",
      desc: "Payment verified & queued for print",
      icon: CheckCircle2,
      done: true,
      active: currentStageIndex === 0,
    },
    {
      id: "farm",
      label: "Print Farm",
      desc: "G-code slicing & layer extrusion",
      icon: Layers,
      done: currentStageIndex >= 1,
      active: currentStageIndex === 1,
    },
    {
      id: "shipped",
      label: "Dispatched",
      desc: shipment?.courierName ? `Via ${shipment.courierName}` : "In transit to destination",
      icon: Truck,
      done: currentStageIndex >= 2,
      active: currentStageIndex === 2,
    },
    {
      id: "delivered",
      label: "Delivered",
      desc: "Received & quality verified",
      icon: Package,
      done: currentStageIndex >= 3,
      active: currentStageIndex === 3,
    },
  ];

  // Progress percentage for background bar: 0%, 33%, 66%, 100%
  const progressPercent = (currentStageIndex / 3) * 100;

  return (
    <div className="space-y-4 pt-3 border-t border-zinc-800/80">
      {/* Animated Pipeline Bar */}
      <div className="relative p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-40 h-20 bg-red-600/10 blur-3xl pointer-events-none" />

        {/* Milestone Steps Header & Track */}
        <div className="relative z-10">
          {/* Progress Track Line */}
          <div className="absolute top-6 left-8 right-8 h-1 bg-zinc-800 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-red-500 to-emerald-500 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Animated Moving Truck Indicator along the track */}
          {currentStageIndex >= 2 && !isDelivered && (
            <div
              className="absolute top-2 z-20 transition-all duration-700 pointer-events-none"
              style={{ left: `calc(${progressPercent}% - 14px)` }}
            >
              <div className="p-1.5 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/50 animate-bounce">
                <Truck className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Milestone Step Nodes */}
          <div className="relative grid grid-cols-4 gap-2">
            {stages.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={st.id} className="flex flex-col items-center text-center group">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 ${
                      st.done
                        ? "bg-emerald-950 text-emerald-400 border-2 border-emerald-500 shadow-md shadow-emerald-950/50"
                        : st.active
                        ? "bg-red-600 text-white border-2 border-red-400 shadow-lg shadow-red-600/40 ring-4 ring-red-500/20 animate-pulse"
                        : "bg-zinc-900 text-zinc-600 border-2 border-zinc-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="mt-3 space-y-0.5">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        st.done || st.active ? "text-white" : "text-zinc-500"
                      }`}
                    >
                      {st.label}
                    </p>
                    <p className="text-[10px] text-zinc-400 hidden sm:block max-w-[110px] truncate">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Status Sub-banner */}
        <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-zinc-400">Current Status:</span>
            <span className="font-bold text-white uppercase tracking-wider">
              {isDelivered
                ? "Delivered Successfully"
                : isShipped
                ? `In Transit (${shipment?.courierName || "Express Courier"})`
                : isPrinted
                ? "Print Farm Extrusion & Slicing"
                : "Order Confirmed & Queued"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowFlowchart(!showFlowchart)}
            className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <span>{showFlowchart ? "Hide Logistics Flowchart" : "View Logistics Flowchart"}</span>
            {showFlowchart ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Flowchart Representation */}
      {showFlowchart && (
        <div className="p-5 rounded-2xl bg-zinc-950 border border-red-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Fulfillment & Dispatch Logistics Flowchart
              </h4>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              BOS Trace ID: {order.orderNumber}
            </span>
          </div>

          {/* Flowchart Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-red-400">STAGE 01</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-bold">
                  DONE
                </span>
              </div>
              <h5 className="text-xs font-bold text-white">Order Placement</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Cart checkout verified, invoice automatically synchronized with BOS.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-red-400">STAGE 02</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    currentStageIndex >= 1
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {currentStageIndex >= 1 ? "DONE" : "QUEUED"}
                </span>
              </div>
              <h5 className="text-xs font-bold text-white">Print Farm Slicing</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Dual linear rail CoreXY extruder assigned. 0.08mm layer precision slicing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-red-400">STAGE 03</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    currentStageIndex >= 2
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {currentStageIndex >= 2 ? "DONE" : "PENDING"}
                </span>
              </div>
              <h5 className="text-xs font-bold text-white">Optical & Caliper QC</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Caliper dimension verification, surface post-cleaning, and anti-static packaging.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-red-400">STAGE 04</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isShipped
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {isShipped ? "ACTIVE" : "PENDING"}
                </span>
              </div>
              <h5 className="text-xs font-bold text-white">Courier Dispatch</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Handover to {shipment?.courierName || "Surface Logistics Hub"} with barcoded AWB.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-red-400">STAGE 05</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isDelivered
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {isDelivered ? "DELIVERED" : "DESTINATION"}
                </span>
              </div>
              <h5 className="text-xs font-bold text-white">Final Handover</h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Contactless delivery to customer doorstep with proof of delivery acknowledgment.
              </p>
            </div>
          </div>

          {/* Shipment Details Pill */}
          {shipment && (
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-red-400" />
                <span>
                  Courier: <strong className="text-white">{shipment.courierName || "Express Courier"}</strong>
                </span>
                {shipment.trackingNumber && (
                  <span>
                    Tracking: <strong className="text-red-400 font-mono">{shipment.trackingNumber}</strong>
                  </span>
                )}
              </div>
              {shipment.trackingUrl && (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-400 hover:text-white flex items-center gap-1 font-semibold"
                >
                  <span>Track Consignment</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
