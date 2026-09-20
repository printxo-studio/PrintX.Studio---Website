const fs = require('fs');
const path = require('path');

const bosTestFile = path.resolve('..', 'PrintXO - BOS', 'test-db-script.js');
const code = [
  "const { PrismaClient } = require('@prisma/client');",
  "const prisma = new PrismaClient();",
  "async function main() {",
  "  try {",
  "    const products = await prisma.product.count();",
  "    const orders = await prisma.order.count();",
  "    const leads = await prisma.lead.count();",
  "    const customers = await prisma.customer.count();",
  "    console.log('--- SUPABASE POSTGRESQL STATUS ---');",
  "    console.log('✓ Status: ONLINE & HEALTHY');",
  "    console.log('✓ Products Count:', products);",
  "    console.log('✓ Orders Count:', orders);",
  "    console.log('✓ Leads Count:', leads);",
  "    console.log('✓ Customers Count:', customers);",
  "  } catch (e) {",
  "    console.error('Error:', e.message);",
  "  } finally {",
  "    await prisma.$disconnect();",
  "  }",
  "}",
  "main();"
].join('\n');

fs.writeFileSync(bosTestFile, code, 'utf8');
console.log('Created test script in BOS');
