import { NextResponse } from "next/server";
import { createOrderWithOtp } from "@/lib/repositories/publicOrders";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      notes,
      paymentType,
      source,
      items,
    } = body ?? {};

    if (!firstName || !lastName || !phone || !address || !city) {
      return NextResponse.json({ message: "Missing required customer fields" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    const normalizedItems = items.map((item: any) => ({
      variantId: String(item.variantId),
      quantity: Number(item.quantity),
    }));

    const result = await createOrderWithOtp({
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      notes,
      paymentType,
      source,
      items: normalizedItems,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Order creation error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to create order" },
      { status: 400 },
    );
  }
}
