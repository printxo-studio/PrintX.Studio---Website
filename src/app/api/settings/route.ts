import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "PRINTXO_SYSTEM_CONFIG" },
    });

    let config = {
      gstEnabled: false,
      gstin: "",
      companyName: "PrintX Studio",
    };

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        config = { ...config, ...parsed };
      } catch (e) {}
    }

    return NextResponse.json({ success: true, settings: config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, settings: { gstEnabled: false } },
      { status: 200 }
    );
  }
}
