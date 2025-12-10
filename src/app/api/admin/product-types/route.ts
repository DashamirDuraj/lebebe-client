import { NextResponse } from "next/server";
import {
  createAdminProductType,
  deleteAdminProductType,
  getAdminProductTypes,
} from "@/lib/repositories/admin";

export async function GET() {
  const items = await getAdminProductTypes();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.name || !body?.slug) {
      return NextResponse.json({ message: "name and slug are required" }, { status: 400 });
    }
    const item = await createAdminProductType(body.name, body.slug);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error("Create product type error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to create product type" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    if (!body?.id) {
      return NextResponse.json({ message: "id is required" }, { status: 400 });
    }
    await deleteAdminProductType(body.id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Delete product type error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to delete product type" },
      { status: 400 },
    );
  }
}
