import { NextResponse } from "next/server";
import { createAdminProduct, getAdminProductsTable } from "@/lib/repositories/admin";

export async function GET() {
  const products = await getAdminProductsTable();
  return NextResponse.json({ items: products });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["name", "slug", "gender", "variants"];
    for (const field of required) {
      if (!body?.[field]) {
        return NextResponse.json({ message: `${field} is required` }, { status: 400 });
      }
    }
    if (!Array.isArray(body.variants) || body.variants.length === 0) {
      return NextResponse.json({ message: "variants is required" }, { status: 400 });
    }

    const product = await createAdminProduct({
      name: body.name,
      slug: body.slug,
      type: body.type,
      gender: body.gender,
      productTypeId: body.productTypeId,
      description: body.description,
      shortDescription: body.shortDescription,
      isNew: body.isNew,
      isBestSeller: body.isBestSeller,
      isOnSale: body.isOnSale,
      salePercent: body.salePercent,
      isActive: body.isActive,
      categoryId: body.categoryId,
      inventoryBatchId: body.inventoryBatchId ?? null,
      variants: body.variants.map((variant: any) => ({
        id: variant.id,
        sizeFromMonths: Number(variant.sizeFromMonths ?? 0),
        sizeToMonths: Number(variant.sizeToMonths ?? 0),
        color: variant.color ?? "Multicolor",
        retailPrice: Number(variant.retailPrice ?? 0),
        wholesalePrice: variant.wholesalePrice != null ? Number(variant.wholesalePrice) : null,
        stock: Number(variant.stock ?? 0),
      })),
      media: Array.isArray(body.media)
        ? body.media.map((m: any) => ({
            url: m.url,
            type: m.type,
            altText: m.altText,
            isThumbnail: m.isThumbnail,
          }))
        : undefined,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error("Create product error", error);
    return NextResponse.json(
      { message: error?.message ?? "Unable to create product" },
      { status: 400 },
    );
  }
}
