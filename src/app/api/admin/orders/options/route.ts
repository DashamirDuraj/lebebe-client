import { NextResponse } from "next/server";
import { getAdminOrderProductOptions } from "@/lib/repositories/admin";

export async function GET() {
  const items = await getAdminOrderProductOptions();
  return NextResponse.json({ items });
}
