import { NextResponse } from "next/server";
import { getPublicProducts } from "@/lib/repositories/publicProducts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("categorySlug") || undefined;
  const tags = searchParams
    .getAll("tag")
    .flatMap((v) => v.split(","))
    .filter(Boolean);
  const search = searchParams.get("search") || undefined;
  const gender = searchParams.get("gender") || undefined;
  const page = Number(searchParams.get("page")) || undefined;
  const pageSize = Number(searchParams.get("pageSize")) || undefined;

  const data = await getPublicProducts({
    categorySlug,
    tags: tags.length ? tags : undefined,
    search,
    gender,
    page,
    pageSize,
  });
  return NextResponse.json(data);
}
