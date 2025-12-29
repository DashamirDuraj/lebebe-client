import { NextResponse } from "next/server";
import { createAdminOrder, getAdminOrdersTable } from "@/lib/repositories/admin";

export async function GET() {
  const orders = await getAdminOrdersTable();
  return NextResponse.json({ items: orders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = [
      "firstName",
      "lastName",
      "phone",
      "address",
      "city",
      "paymentType",
      "source",
      "status",
      "deliveryStatus",
      "items",
    ];
    for (const field of required) {
      if (!body?.[field]) {
        return NextResponse.json({ message: `${field} is required` }, { status: 400 });
      }
    }

    const order = await createAdminOrder({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      address: body.address,
      city: body.city,
      postalCode: body.postalCode,
      notes: body.notes,
      paymentType: body.paymentType,
      source: body.source,
      status: body.status,
      deliveryStatus: body.deliveryStatus,
      items: Array.isArray(body.items)
        ? body.items.map((item: any) => ({
            variantId: item.variantId,
            quantity: Number(item.quantity ?? 0),
          }))
        : [],
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Create admin order error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to create order" },
      { status: 400 },
    );
  }
}
