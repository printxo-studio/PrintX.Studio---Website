const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting PrintXO Studio database seeding...");

  // 1. Seed Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      storeName: "PrintXO Studio",
      contactEmail: "support@printxo.com",
      contactPhone: "+91 98765 43210",
      address: "PrintXO Studio Labs, Tech Maker Hub, India",
      currencySymbol: "₹",
      currencyCode: "INR",
      taxRatePercent: 18.0,
      shippingFlatRate: 149.0,
      freeShippingThreshold: 1499.0,
      announcementBanner: "Precision Additive Manufacturing: Free express shipping on orders over ₹1,499",
      enableStripe: true,
    },
  });

  // 2. Seed Users (Admin & Customer)
  const adminPassword = await bcrypt.hash("Admin@PrintXO2026", 10);
  const customerPassword = await bcrypt.hash("Customer@PrintXO2026", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@printxo.com" },
    update: {},
    create: {
      name: "Studio Administrator",
      email: "admin@printxo.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      phone: "+91 98765 43210",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@printxo.com" },
    update: {},
    create: {
      name: "Vikram Sharma",
      email: "customer@printxo.com",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      phone: "+91 98450 12345",
      addresses: {
        create: {
          fullName: "Vikram Sharma",
          phone: "+91 98450 12345",
          street: "402 Maker Enclave, 12th Main Road",
          city: "Bengaluru",
          state: "Karnataka",
          postalCode: "560038",
          country: "IN",
          isDefault: true,
        },
      },
    },
  });

  // 3. Seed Categories
  const categoriesData = [
    {
      id: "cat-1",
      name: "Desk & Office",
      slug: "desk-and-office",
      description: "Ergonomic phone docks, headphone hangers, and cable managers.",
      image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "cat-2",
      name: "Home & Decor",
      slug: "home-and-decor",
      description: "Parametric Voronoi ambient lamps and modern planters.",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "cat-3",
      name: "Gaming & Cosplay",
      slug: "gaming-and-cosplay",
      description: "Controller mounts, artisan keycaps, and armor props.",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "cat-4",
      name: "Miniatures & Art",
      slug: "miniatures-and-art",
      description: "8K resin tabletop figurines and collector sculptures.",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "cat-5",
      name: "Engineering & Parts",
      slug: "engineering-and-parts",
      description: "Carbon-fiber drone frames, caliper wall docks, and robotics gears.",
      image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 4. Seed Products
  const productsData = [
    {
      id: "prod-1",
      name: "CyberVoronoi Minimalist Table Lamp",
      slug: "cyber-voronoi-table-lamp",
      sku: "PXO-HMD-001",
      shortDescription: "Parametric Voronoi cage lamp casting geometric ambient light patterns.",
      fullDescription: "Engineered with precision computational Voronoi structures in heat-resistant PETG filament. Features an integrated socket fitting and weighted anti-skid base.",
      price: 1899,
      salePrice: 1599,
      costPrice: 650,
      stockQuantity: 18,
      lowStockThreshold: 5,
      material: "PETG Matte Translucent",
      colorOptions: ["Charcoal Black", "Crimson Red", "Bone White"],
      dimensions: "140 x 140 x 220 mm",
      productionTimeDays: 2,
      isFeatured: true,
      categoryId: "cat-2",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80",
            altText: "CyberVoronoi Table Lamp",
            sortOrder: 0,
          },
        ],
      },
    },
    {
      id: "prod-2",
      name: "Vortex Spiral Dual-Device Charging Dock",
      slug: "vortex-spiral-charging-dock",
      sku: "PXO-DSK-002",
      shortDescription: "Dual phone & smartwatch stand with concealed cable routing channel.",
      fullDescription: "Keep your desktop sleek and wire-free with an optimal 60-degree viewing angle for notifications.",
      price: 1299,
      salePrice: 1099,
      costPrice: 380,
      stockQuantity: 24,
      lowStockThreshold: 6,
      material: "PLA+ High Precision",
      colorOptions: ["Stealth Black", "Titanium Grey", "Vivid Red"],
      dimensions: "115 x 90 x 135 mm",
      productionTimeDays: 1,
      isFeatured: true,
      categoryId: "cat-1",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1000&q=80",
            altText: "Vortex Charging Dock",
            sortOrder: 0,
          },
        ],
      },
    },
    {
      id: "prod-3",
      name: "Titan Mechanical Headphone Hanger",
      slug: "titan-mechanical-headphone-hanger",
      sku: "PXO-DSK-003",
      shortDescription: "Under-desk clampable heavy-duty headphone mount with aerospace ribbing.",
      fullDescription: "Built with carbon-fiber reinforced composite PLA, clamping desks up to 45mm thick without screws.",
      price: 849,
      costPrice: 240,
      stockQuantity: 35,
      lowStockThreshold: 10,
      material: "Carbon Fiber Reinforced PLA",
      colorOptions: ["Matte Carbon Black", "Crimson Red Accent"],
      dimensions: "130 x 60 x 110 mm",
      productionTimeDays: 1,
      isFeatured: true,
      categoryId: "cat-1",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80",
            altText: "Titan Headphone Hanger",
            sortOrder: 0,
          },
        ],
      },
    },
    {
      id: "prod-4",
      name: "8K Resin Archmage Wyrm Figurine",
      slug: "8k-resin-archmage-wyrm-figurine",
      sku: "PXO-MIN-004",
      shortDescription: "Ultra-fine tabletop dragon miniature cured at 0.025mm layer thickness.",
      fullDescription: "Printed on 8K monochrome resin printers. Every scale and claw is captured with microscopic fidelity.",
      price: 1699,
      salePrice: 1449,
      costPrice: 500,
      stockQuantity: 8,
      lowStockThreshold: 4,
      material: "Tough Engineering 8K Resin",
      colorOptions: ["Primed Grey", "Cured Obsidian Black"],
      dimensions: "160 x 130 x 175 mm",
      productionTimeDays: 3,
      isFeatured: true,
      categoryId: "cat-4",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=1000&q=80",
            altText: "8K Resin Dragon Figurine",
            sortOrder: 0,
          },
        ],
      },
    },
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    });
  }

  // 5. Seed Coupons
  const couponsData = [
    {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrderValue: 999,
      maxDiscount: 500,
      usageLimit: 1000,
    },
    {
      code: "PRINTXO50",
      type: "FIXED_AMOUNT",
      value: 200,
      minOrderValue: 1499,
      maxDiscount: 200,
      usageLimit: 500,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  console.log("✅ Seed completed successfully!");
  console.log("Admin account: admin@printxo.com / Admin@PrintXO2026");
  console.log("Customer account: customer@printxo.com / Customer@PrintXO2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
