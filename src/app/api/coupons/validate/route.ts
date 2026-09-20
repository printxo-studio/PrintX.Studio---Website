import { NextResponse } from "next/server";
import { INITIAL_COUPONS } from "@/lib/mock-data";

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false, message: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = INITIAL_COUPONS.find((c) => c.code === cleanCode && c.isActive);

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Invalid or expired coupon code." }, { status: 404 });
    }

    const currentTotal = Number(cartTotal || 0);
    if (currentTotal < coupon.minOrderValue) {
      return NextResponse.json({
        valid: false,
        message: `Requires a minimum cart value of ₹${coupon.minOrderValue}.`,
      }, { status: 400 });
    }

    let calculatedDiscount = 0;
    if (coupon.type === "PERCENTAGE") {
      calculatedDiscount = (currentTotal * coupon.value) / 100;
      if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
        calculatedDiscount = coupon.maxDiscount;
      }
    } else {
      calculatedDiscount = Math.min(coupon.value, currentTotal);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount: calculatedDiscount,
      },
      message: `Coupon ${coupon.code} applied successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to validate coupon" }, { status: 500 });
  }
}
