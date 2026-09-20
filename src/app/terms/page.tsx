import React from "react";

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions of PrintX Studio 3D printing services.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 text-zinc-300">
      <div>
        <h1 className="text-3xl font-black text-white">Terms of Service</h1>
        <p className="text-xs text-zinc-500 mt-1">Last revised: September 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Additive Manufacturing Tolerances</h2>
          <p>
            PrintX Studio operates precision FDM and SLA/Resin printers. Standard manufacturing tolerances are ±0.15mm for engineering filaments and ±0.05mm for 8K resin. For interference fit or snap-together assemblies, we advise referencing our published design tolerance guidelines.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Intellectual Property & CAD Files</h2>
          <p>
            Customers retain 100% full ownership and intellectual property rights to CAD files (STL, OBJ, 3MF, STEP) submitted to our custom printing portal. Files are stored within encrypted partitions solely for manufacturing and quality assurance, and are never shared or sold.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Custom Print Approvals & Cancellations</h2>
          <p>
            Once a custom print quote is approved and sent to our slicing queue, print jobs enter machine setup immediately. Cancellations are accommodated prior to filament extrusion or resin vat exposure.
          </p>
        </section>
      </div>
    </div>
  );
}
