import { NextResponse } from "next/server";
import { searchPublicProducts } from "@/lib/repositories/publicProducts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const results = await searchPublicProducts(query);
  return NextResponse.json({ items: results });
}
