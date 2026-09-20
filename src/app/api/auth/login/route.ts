import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = LoginSchema.parse(body);

    const emailNormalized = validated.email.trim().toLowerCase();

    const customer = await prisma.customer.findFirst({
      where: { email: { equals: emailNormalized, mode: "insensitive" } },
    });

    if (!customer || !customer.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(validated.password, customer.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (customer.status === "BLOCKED") {
      return NextResponse.json(
        { error: "Your account is temporarily suspended. Please contact PrintX support." },
        { status: 403 }
      );
    }

    const token = await createSessionToken({
      customerId: customer.id,
      customerCode: customer.customerCode,
      email: customer.email!,
      name: customer.name,
      role: "CUSTOMER",
    });

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully",
      customer: {
        id: customer.id,
        customerCode: customer.customerCode,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
      },
    });

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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to process login" }, { status: 500 });
  }
}
