import { NextResponse } from "next/server";
import { getAdminOrdersTable } from "@/lib/repositories/admin";

export async function GET() {
  const orders = await getAdminOrdersTable();
  return NextResponse.json({ items: orders });
}
