import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
});

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = ProfileUpdateSchema.parse(body);

    const updated = await prisma.customer.update({
      where: { id: session.customerId },
      data: {
        ...(validated.name && { name: validated.name.trim() }),
        ...(validated.phone !== undefined && { phone: validated.phone?.trim() || null }),
        ...(validated.company !== undefined && { company: validated.company?.trim() || null }),
        ...(validated.address !== undefined && { address: validated.address?.trim() || null }),
        ...(validated.city !== undefined && { city: validated.city?.trim() || "Bengaluru" }),
        ...(validated.state !== undefined && { state: validated.state?.trim() || "Karnataka" }),
        ...(validated.pincode !== undefined && { pincode: validated.pincode?.trim() || null }),
      },
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
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      customer: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
