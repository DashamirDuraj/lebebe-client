import { NextResponse } from "next/server";
import { getAdminClientsTable } from "@/lib/repositories/admin";

export async function GET() {
  const clients = await getAdminClientsTable();
  return NextResponse.json({ items: clients });
}
