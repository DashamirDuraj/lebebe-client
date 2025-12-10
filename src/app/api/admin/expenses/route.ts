import { NextResponse } from "next/server";
import { getAdminExpensesTable } from "@/lib/repositories/admin";

export async function GET() {
  const expenses = await getAdminExpensesTable();
  return NextResponse.json({ items: expenses });
}
