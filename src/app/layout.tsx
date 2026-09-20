import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth-context";
import AuthModal from "@/components/auth/AuthModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | PrintX Studio",
    default: "PrintX Studio | Precision 3D Printing & Custom Additive Manufacturing",
  },
  description:
    "Bespoke 3D printed creations, rapid on-demand prototyping, and precision additive engineering. Upload STL/OBJ/3MF files for instant quote and express delivery across India.",
  keywords: [
    "3D printing India",
    "custom 3D print",
    "STL upload",
    "PETG",
    "PLA+",
    "resin miniatures",
    "rapid prototyping",
    "mechanical parts",
  ],
  authors: [{ name: "PrintX Studio" }],
  openGraph: {
    title: "PrintX Studio | Precision 3D Printing",
    description:
      "Precision 3D printed products and custom additive manufacturing. Upload your CAD models today.",
    url: "https://printx.studio",
    siteName: "PrintX Studio",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-red-600 selection:text-white`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
