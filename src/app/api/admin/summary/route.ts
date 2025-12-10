import { NextResponse } from "next/server";
import { getAdminRevenueSummary } from "@/lib/repositories/admin";

export async function GET() {
  const data = await getAdminRevenueSummary();
  return NextResponse.json(data);
}
