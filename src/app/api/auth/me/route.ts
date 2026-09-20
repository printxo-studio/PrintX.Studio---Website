import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.customerId) {
      return NextResponse.json({ authenticated: false, customer: null });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
      select: {
        id: true,
        customerCode: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        country: true,
        customerType: true,
        rating: true,
        status: true,
        createdAt: true,
      },
    });

    if (!customer || customer.status === "BLOCKED") {
      return NextResponse.json({ authenticated: false, customer: null });
    }

    return NextResponse.json({
      authenticated: true,
      customer,
    });
  } catch (error: any) {
    console.error("Auth me error:", error);
    return NextResponse.json({ authenticated: false, customer: null }, { status: 500 });
  }
}
