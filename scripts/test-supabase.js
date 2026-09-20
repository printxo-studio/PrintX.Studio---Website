const { PrismaClient } = require('../PrintXO - BOS/node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.bmnmwtbidcncjtbecvwa:%4084e9241fujsps2991B2817@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
    }
  }
});

async function main() {
  try {
    const productsCount = await prisma.product.count();
    const ordersCount = await prisma.order.count();
    const leadsCount = await prisma.lead.count();
    const customersCount = await prisma.customer.count();
    console.log('✓ Supabase PostgreSQL connection is ACTIVE and HEALTHY:');
    console.log(`  - Products in DB: ${productsCount}`);
    console.log(`  - Orders in DB: ${ordersCount}`);
    console.log(`  - Leads in DB: ${leadsCount}`);
    console.log(`  - Customers in DB: ${customersCount}`);
  } catch (err) {
    console.error('Supabase DB connection error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
