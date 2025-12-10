import { NextResponse } from "next/server";
import { getPublicCategories } from "@/lib/repositories/publicProducts";

export async function GET() {
  const categories = await getPublicCategories();
  return NextResponse.json({ categories });
}
