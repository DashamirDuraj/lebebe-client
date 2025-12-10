import { NextResponse } from "next/server";
import { getPublicProductBySlug } from "@/lib/repositories/publicProducts";

type Params = {
  params: { slug: string };
};

export async function GET(_req: Request, { params }: Params) {
  const product = await getPublicProductBySlug(params.slug);
  if (!product) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}
