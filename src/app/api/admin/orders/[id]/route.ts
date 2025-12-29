import { NextResponse } from "next/server";
import {
  deleteAdminOrder,
  getAdminOrderDetail,
  updateAdminOrder,
} from "@/lib/repositories/admin";

type Params = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing order id" }, { status: 400 });
    }
    const order = await getAdminOrderDetail(id);
    if (!order) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Admin order detail error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to fetch order" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing order id" }, { status: 400 });
    }
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
    const order = await updateAdminOrder(id, {
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
    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Update order error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to update order" },
      { status: 400 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing order id" }, { status: 400 });
    }
    await deleteAdminOrder(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete order error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to delete order" },
      { status: 400 },
    );
  }
}
