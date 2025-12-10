import { NextResponse } from "next/server";
import { verifyOrderOtp } from "@/lib/repositories/publicOrders";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, otpCode } = body ?? {};

    if (!orderId || !otpCode) {
      return NextResponse.json({ message: "orderId and otpCode are required" }, { status: 400 });
    }

    const result = await verifyOrderOtp(String(orderId), String(otpCode));
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error("OTP verification error", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Unable to verify OTP" },
      { status: 400 },
    );
  }
}
