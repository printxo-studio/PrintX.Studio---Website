# PrintX Studio — Precision 3D Printing & Additive Manufacturing Platform

A high-performance full-stack e-commerce and custom CAD quoting web application engineered for **PrintX Studio**. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Three.js 3D WebGL Visualization, Prisma ORM, and PostgreSQL.

---

## 🚀 Key Features

### 🛒 Customer Storefront & E-Commerce
- **Futuristic Maker Studio Aesthetics**: Dark charcoal base, vivid crimson red accents (`#E50914`), titanium silver highlights, and sleek glassmorphism.
- **Dynamic Catalog**: Full search with debounce, multi-filter drawer (Categories, Material family, Price range, In-stock status), and sorting.
- **Interactive 3D Model Inspector**: Native Three.js WebGL canvas allowing customers to rotate, pan, toggle layer lines, change filament colors, and inspect dimensions (X, Y, Z mm).
- **Persistent Cart & Checkout**: Slide-out cart drawer, dynamic free-shipping progress tracker, coupon codes (`WELCOME10`, `PRINTXO50`), address collection, and Stripe / UPI checkout.
- **Order Confirmation & Invoices**: Detailed post-checkout status timeline and printable/downloadable invoices.

### 📐 Custom 3D Print Request & Quoting Engine
- **CAD File Upload**: Drag-and-drop dropzone supporting `.stl`, `.obj`, `.3mf`, `.step`, and reference `.pdf/.png` up to 50MB.
- **Live 3D Geometry Analyzer**: Client-side WebGL rendering of uploaded files with real-time volume and dimension estimations.
- **Technical Specification Form**: Slicing preferences, infill density, polymer choices (PLA+, PETG, Carbon Fiber, 8K Resin, TPU), surface finishes, target budget, and deadlines.
- **Quote-to-Order Conversion**: Customers review itemized quotes (material, machine labor, shipping), accept with one click, and convert directly into a payable checkout session.
- **Direct Messaging Thread**: Integrated customer-to-studio messaging for tolerance checks and slicing recommendations.

### 🛡️ Admin Operations Suite (`/admin`)
- **Executive Telemetry**: Gross revenue analytics, weekly printer nozzle hours, pending CAD quote alerts, and low stock monitors.
- **Product & Category CRUD**: Multi-image management, SKU generation, material chips, active/draft toggles, and catalog taxonomy.
- **Order Lifecycle Management**: One-click status transitions (`Pending` → `Confirmed` → `In Production` → `Quality Check` → `Shipped` → `Delivered`), tracking numbers, and invoice printing.
- **Custom Quote Studio**: 3D mesh inspection viewer, quote builder (material cost + machine time + shipping), and two-way messaging.
- **Inventory Replenishment**: Low stock filament/resin alerts with instant inline restock buttons.
- **Coupon Management**: Percentage and fixed discount codes with usage limits.
- **Store & GST Settings**: Configurable 18% GST rate, flat shipping fees, free shipping thresholds, and announcement banners.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, Server Components, Route Handlers)
- **Language**: TypeScript 5 (Strict mode)
- **Styling**: Tailwind CSS v4, Lucide Icons, Glassmorphism & Custom Glows
- **3D Graphics**: Three.js (WebGL interactive 3D model inspector)
- **Database & ORM**: PostgreSQL with Prisma ORM 6
- **Payments**: Stripe Checkout & PaymentIntent (with dev simulation fallback)
- **Storage**: Storage provider abstraction (local disk `/public/uploads` for zero-friction dev, Cloudinary/S3 ready)
- **Email**: Resend transactional email service with development console logger fallback

---

## 💻 Local Quickstart Guide

### 1. Prerequisites
- Node.js 18.18+ or 20+
- npm 9+ or pnpm

### 2. Installation
```bash
# Clone or navigate to the repository
cd "PrintXO - Website"

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the example environment configuration:
```bash
cp .env.example .env
```

Default variables in `.env`:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="printxo_studio_super_secret_jwt_key_2026_at_least_32_chars_long"

# PostgreSQL Connection String (Neon / Supabase / Local Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/printxo_db?schema=public"

# Payments (Leave as placeholder for instant dev simulation mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_placeholder"
STRIPE_SECRET_KEY="sk_test_placeholder"

# Storage & Email
STORAGE_PROVIDER="local"
EMAIL_PROVIDER="console"

# Currency
NEXT_PUBLIC_CURRENCY_SYMBOL="₹"
NEXT_PUBLIC_CURRENCY_CODE="INR"
```

### 4. Database Setup & Seeding

#### Option A: Using Local Docker PostgreSQL
```bash
# Start PostgreSQL container
docker-compose up -d

# Push schema and generate Prisma client
npx prisma db push

# Seed initial products, categories, coupons, and accounts
npm run db:seed
```

#### Option B: Using Cloud PostgreSQL (Neon / Supabase / Railway)
1. Create a free database at [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
2. Paste your connection string into `DATABASE_URL` in `.env`.
3. Run:
```bash
npx prisma db push
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Seed Accounts

| Role | Email | Password | Access Path |
|------|-------|----------|-------------|
| **Studio Admin** | `admin@printxo.com` | `Admin@PrintXO2026` | `/admin` |
| **Customer** | `customer@printxo.com` | `Customer@PrintXO2026` | `/account` |

---

## 🧪 Verification & Testing Guide

Run the type check and build verification:
```bash
# Validate TypeScript types
npx tsc --noEmit

# Validate Prisma Schema
npx prisma validate

# Build production bundle
npm run build
```

---

## ☁️ Deployment Guide (Vercel + Neon PostgreSQL)

1. **Database**: Create a PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. **Push Code**: Push your repository to GitHub.
3. **Import to Vercel**: Connect the repository in Vercel.
4. **Environment Variables**: Add all variables from `.env.example` in Vercel Project Settings:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `STRIPE_SECRET_KEY` (if live payments enabled)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. **Post-Deploy**: Run `npx prisma db push && npm run db:seed` against the production database.
