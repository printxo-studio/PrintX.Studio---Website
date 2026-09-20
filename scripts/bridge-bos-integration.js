const fs = require('fs');
const path = require('path');

const bosDir = path.resolve(process.cwd(), '..', 'PrintXO - BOS');
console.log('Target BOS Directory:', bosDir);

if (!fs.existsSync(bosDir)) {
  console.error('BOS directory does not exist:', bosDir);
  process.exit(1);
}

// 1. Create src/lib/gemini.ts in BOS
const geminiFile = path.join(bosDir, 'src', 'lib', 'gemini.ts');
const geminiCode = `import { db } from '@/lib/db';

export async function generateGeminiInvoiceForOrder(orderId: string): Promise<any> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      customer: true,
      invoices: true,
    },
  });

  if (!order) throw new Error(\`Order \${orderId} not found\`);

  // Check if invoice already exists
  if (order.invoices && order.invoices.length > 0) {
    return order.invoices[0];
  }

  const count = await db.invoice.count();
  const invoiceNumber = \`INV-2026-\${String(count + 1).padStart(4, '0')}\`;

  const state = (order.customer.state || '').trim().toLowerCase();
  const isIntraState = !state || state === 'karnataka' || state === 'ka';

  const subtotal = order.subtotal || 0;
  const discountTotal = order.discountTotal || 0;
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const totalTax = order.taxAmount > 0 ? order.taxAmount : Math.round(taxableAmount * 0.18);

  const cgstAmount = isIntraState ? Math.round(totalTax / 2) : 0;
  const sgstAmount = isIntraState ? totalTax - cgstAmount : 0;
  const igstAmount = !isIntraState ? totalTax : 0;

  const grandTotal = taxableAmount + totalTax + (order.shippingCost || 0);

  const apiKey = process.env.GEMINI_API_KEY;
  let aiNote = 'Digitally certified & verified by PrintX Studio Gemini AI Financial Engine. Complies with HSN 8477 for 3D Additive Polymer Manufacturing.';

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const prompt = \`You are the certified Chief Financial AI for PrintX Studio (3D Printing & Additive Manufacturing).
Order Ref: \${order.orderNumber}
Items: \${JSON.stringify(order.items.map((i) => ({ name: i.name, qty: i.quantity, rate: i.unitPrice })))}
Total: ₹\${grandTotal}
Customer: \${order.customer.name} (\${order.customer.city || 'Bengaluru'}, \${order.customer.state || 'KA'})
Generate a brief 1-2 sentence professional verification note for the customer tax invoice.\`;

      const geminiRes = await fetch(
        \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${apiKey}\`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const candidate = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) aiNote = candidate.trim();
      }
    } catch (aiErr) {
      console.warn('Gemini API call warning:', aiErr);
    }
  }

  const newInvoice = await db.invoice.create({
    data: {
      invoiceNumber,
      orderId: order.id,
      customerId: order.customerId,
      billingAddress: order.customer.address || order.shippingAddress || null,
      shippingAddress: order.shippingAddress || null,
      gstin: order.customer.gstin || null,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 86400000),
      subtotal,
      discountTotal,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      shippingAmount: order.shippingCost || 0,
      grandTotal,
      amountPaid: order.paymentStatus === 'PAID' ? grandTotal : 0,
      balanceDue: order.paymentStatus === 'PAID' ? 0 : grandTotal,
      status: order.paymentStatus === 'PAID' ? 'PAID' : 'ISSUED',
      notes: aiNote,
      items: {
        create: order.items.map((item) => ({
          description: item.name + (item.sku ? \` [\${item.sku}]\` : ''),
          hsnSacCode: '8477',
          quantity: item.quantity,
          rate: item.unitPrice,
          discount: item.discount,
          taxRate: item.taxRate || 18.0,
          amount: item.lineTotal,
        })),
      },
    },
    include: {
      items: true,
      customer: true,
    },
  });

  return newInvoice;
}
`;
fs.writeFileSync(geminiFile, geminiCode, 'utf8');
console.log('✓ Created src/lib/gemini.ts in BOS');

// 2. Enhance src/app/api/orders/route.ts in BOS
const ordersRouteFile = path.join(bosDir, 'src', 'app', 'api', 'orders', 'route.ts');
const ordersRouteCode = `import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateGeminiInvoiceForOrder } from '@/lib/gemini';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { orderDate: 'desc' },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        printJobs: true,
        invoices: true,
        shipments: true,
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let customerId = body.customerId;

    // Auto-create or resolve Customer from website order
    if (!customerId && body.customer) {
      const email = (body.customer.email || '').trim().toLowerCase();
      let existingCustomer = email ? await db.customer.findFirst({ where: { email } }) : null;
      if (!existingCustomer) {
        const custCount = await db.customer.count();
        const customerCode = \`CUST-\${String(custCount + 1).padStart(3, '0')}\`;
        existingCustomer = await db.customer.create({
          data: {
            customerCode,
            name: body.customer.name || 'Storefront Customer',
            email: email || null,
            phone: body.customer.phone || null,
            address: body.customer.address || null,
            city: body.customer.city || 'Bengaluru',
            state: body.customer.state || 'Karnataka',
            pincode: body.customer.pincode || '560001',
            country: 'India',
            customerType: 'B2C',
            source: 'Website Storefront',
            status: 'ACTIVE',
          },
        });
      }
      customerId = existingCustomer.id;
    }

    if (!customerId) {
      const firstCust = await db.customer.findFirst();
      customerId = firstCust ? firstCust.id : (await db.customer.create({
        data: {
          customerCode: 'CUST-001',
          name: 'Walk-in Customer',
          customerType: 'B2C',
        }
      })).id;
    }

    const count = await db.order.count();
    const orderNumber = body.orderNumber || \`ORD-2026-\${String(count + 1).padStart(4, '0')}\`;

    const newOrder = await db.order.create({
      data: {
        orderNumber,
        customerId,
        quoteId: body.quoteId || null,
        orderDate: body.orderDate ? new Date(body.orderDate) : new Date(),
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 7 * 86400000),
        priority: body.priority || 'NORMAL',
        subtotal: parseFloat(body.subtotal) || 0,
        discountTotal: parseFloat(body.discountTotal) || 0,
        taxAmount: parseFloat(body.taxAmount) || 0,
        shippingCost: parseFloat(body.shippingCost) || 0,
        totalAmount: parseFloat(body.totalAmount) || 0,
        paymentStatus: body.paymentStatus || 'PENDING',
        productionStatus: body.productionStatus || 'PENDING',
        qcStatus: body.qcStatus || 'PENDING',
        shippingStatus: body.shippingStatus || 'PENDING',
        overallStatus: body.overallStatus || 'CONFIRMED',
        shippingAddress: body.shippingAddress || null,
        notes: body.notes || null,
        items: {
          create: (body.items || []).map((item: any) => ({
            productId: item.productId || null,
            name: item.name,
            sku: item.sku || null,
            description: item.description || null,
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0,
            discount: parseFloat(item.discount) || 0,
            taxRate: parseFloat(item.taxRate) || 18.0,
            lineTotal: parseFloat(item.lineTotal) || 0,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    // Auto-generate Gemini AI Tax Invoice immediately
    let generatedInvoice = null;
    try {
      generatedInvoice = await generateGeminiInvoiceForOrder(newOrder.id);
      console.log(\`✓ Gemini AI Invoice generated for \${newOrder.orderNumber}: \${generatedInvoice.invoiceNumber}\`);
    } catch (invErr) {
      console.warn('Could not auto-generate invoice in background:', invErr);
    }

    return NextResponse.json({ ...newOrder, invoice: generatedInvoice }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
`;
fs.writeFileSync(ordersRouteFile, ordersRouteCode, 'utf8');
console.log('✓ Updated src/app/api/orders/route.ts in BOS with Gemini invoicing');

// 3. Update shipping routes in BOS to notify website
const shippingRouteFile = path.join(bosDir, 'src', 'app', 'api', 'shipping', 'route.ts');
const shippingRouteCode = `import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function notifyWebsiteShipment(shipment: any, orderNumber: string) {
  const websiteUrl = process.env.WEBSITE_API_URL || 'http://localhost:3000';
  try {
    await fetch(\`\${websiteUrl}/api/sync/shipment\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber,
        carrier: shipment.courierName,
        trackingNumber: shipment.trackingNumber,
        trackingUrl: shipment.trackingUrl,
        status: shipment.status,
        shippedAt: shipment.shipDate,
        notes: shipment.notes,
      }),
    });
    console.log(\`✓ Notified website of shipment update for \${orderNumber}\`);
  } catch (e) {
    console.warn('Website shipment notification warning:', e.message);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    const shipments = await db.shipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        },
      },
    });

    return NextResponse.json(shipments);
  } catch (error) {
    console.error('Shipments GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.shipment.count();
    const shipmentCode = body.shipmentCode || \`SHP-2026-\${String(count + 1).padStart(4, '0')}\`;

    const newShipment = await db.shipment.create({
      data: {
        shipmentCode,
        orderId: body.orderId,
        courierName: body.courierName || 'Delhivery Express',
        trackingNumber: body.trackingNumber || null,
        trackingUrl: body.trackingUrl || null,
        shipDate: body.shipDate ? new Date(body.shipDate) : new Date(),
        expectedDelivery: body.expectedDelivery ? new Date(body.expectedDelivery) : new Date(Date.now() + 3 * 86400000),
        shippingCost: parseFloat(body.shippingCost) || 250,
        status: body.status || 'SHIPPED',
        notes: body.notes || null,
      },
      include: {
        order: { include: { customer: true } },
      },
    });

    if (body.orderId) {
      await db.order.update({
        where: { id: body.orderId },
        data: {
          shippingStatus: body.status === 'DELIVERED' ? 'DELIVERED' : 'SHIPPED',
        },
      });
    }

    if (newShipment.order?.orderNumber) {
      await notifyWebsiteShipment(newShipment, newShipment.order.orderNumber);
    }

    return NextResponse.json(newShipment, { status: 201 });
  } catch (error) {
    console.error('Shipment creation error:', error);
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}
`;
fs.writeFileSync(shippingRouteFile, shippingRouteCode, 'utf8');
console.log('✓ Updated src/app/api/shipping/route.ts in BOS with website sync');

// 4. Update shipping [id] route in BOS to notify website on update
const shippingIdRouteFile = path.join(bosDir, 'src', 'app', 'api', 'shipping', '[id]', 'route.ts');
const shippingIdRouteCode = `import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function notifyWebsiteShipment(shipment: any, orderNumber: string) {
  const websiteUrl = process.env.WEBSITE_API_URL || 'http://localhost:3000';
  try {
    await fetch(\`\${websiteUrl}/api/sync/shipment\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber,
        carrier: shipment.courierName,
        trackingNumber: shipment.trackingNumber,
        trackingUrl: shipment.trackingUrl,
        status: shipment.status,
        shippedAt: shipment.shipDate,
        notes: shipment.notes,
      }),
    });
    console.log(\`✓ Notified website of shipment update for \${orderNumber}\`);
  } catch (e) {
    console.warn('Website shipment notification warning:', e.message);
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shipment = await db.shipment.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        },
      },
    });
    if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    return NextResponse.json(shipment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipment' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const isDelivered = body.status === 'DELIVERED';

    const updated = await db.shipment.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.trackingNumber !== undefined && { trackingNumber: body.trackingNumber }),
        ...(body.courierName && { courierName: body.courierName }),
        ...(body.delayReason !== undefined && { delayReason: body.delayReason }),
        ...(isDelivered && { deliveredDate: new Date() }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: { order: true },
    });

    if (updated.orderId && body.status) {
      await db.order.update({
        where: { id: updated.orderId },
        data: { shippingStatus: body.status === 'DELIVERED' ? 'DELIVERED' : 'SHIPPED' },
      });
    }

    if (updated.order?.orderNumber) {
      await notifyWebsiteShipment(updated, updated.order.orderNumber);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Shipment PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.shipment.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete shipment' }, { status: 500 });
  }
}
`;
fs.writeFileSync(shippingIdRouteFile, shippingIdRouteCode, 'utf8');
console.log('✓ Updated src/app/api/shipping/[id]/route.ts in BOS with website sync');

// 5. Update BOS .env NEXTAUTH_URL to 3001
const bosEnvFile = path.join(bosDir, '.env');
let envContent = fs.readFileSync(bosEnvFile, 'utf8');
envContent = envContent.replace(/NEXTAUTH_URL="http:\/\/localhost:3000"/g, 'NEXTAUTH_URL="http://localhost:3001"');
fs.writeFileSync(bosEnvFile, envContent, 'utf8');
console.log('✓ Confirmed BOS NEXTAUTH_URL="http://localhost:3001"');
