import { NextResponse } from "next/server";
import {
  createAdminInventoryBatch,
  getAdminInventoryBatches,
} from "@/lib/repositories/admin";

export async function GET() {
  const items = await getAdminInventoryBatches();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.title || !body?.receivedAt) {
      return NextResponse.json({ message: "title and receivedAt are required" }, { status: 400 });
    }
    const batch = await createAdminInventoryBatch(body.title, body.receivedAt);
    return NextResponse.json({ batch }, { status: 201 });
  } catch (error: any) {
    console.error("Create inventory batch error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to create inventory batch" },
      { status: 400 },
    );
  }
}
