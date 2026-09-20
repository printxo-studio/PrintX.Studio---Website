import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = RegisterSchema.parse(body);

    const emailNormalized = validated.email.trim().toLowerCase();

    // Check if customer email already exists
    const existing = await prisma.customer.findFirst({
      where: { email: { equals: emailNormalized, mode: "insensitive" } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(validated.password);

    // Generate next customerCode (e.g. CUST-005)
    const count = await prisma.customer.count();
    const customerCode = `CUST-${String(count + 1).padStart(3, "0")}`;

    const newCustomer = await prisma.customer.create({
      data: {
        customerCode,
        name: validated.name.trim(),
        email: emailNormalized,
        passwordHash,
        phone: validated.phone?.trim() || null,
        company: validated.company?.trim() || null,
        address: validated.address?.trim() || null,
        city: validated.city?.trim() || "Bengaluru",
        state: validated.state?.trim() || "Karnataka",
        pincode: validated.pincode?.trim() || "560001",
        country: "India",
        customerType: validated.company ? "B2B" : "B2C",
        source: "Website Storefront",
        status: "ACTIVE",
      },
    });

    const token = await createSessionToken({
      customerId: newCustomer.id,
      customerCode: newCustomer.customerCode,
      email: newCustomer.email!,
      name: newCustomer.name,
      role: "CUSTOMER",
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        customer: {
          id: newCustomer.id,
          customerCode: newCustomer.customerCode,
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          company: newCustomer.company,
          address: newCustomer.address,
          city: newCustomer.city,
          state: newCustomer.state,
          pincode: newCustomer.pincode,
        },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
