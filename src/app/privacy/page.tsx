import React from "react";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy and CAD data protection at PrintX Studio.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 text-zinc-300">
      <div>
        <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs text-zinc-500 mt-1">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">CAD & Geometric File Confidentiality</h2>
          <p>
            Your proprietary CAD files, 3D meshes, and technical specifications are handled with non-disclosure agreement (NDA) level confidentiality. We do not use client models for marketing without express written consent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">Payment & Billing Security</h2>
          <p>
            All payment card data is processed via Stripe using bank-level 256-bit encryption. PrintX Studio does not store raw credit/debit card numbers on its servers.
          </p>
        </section>
      </div>
    </div>
  );
}
