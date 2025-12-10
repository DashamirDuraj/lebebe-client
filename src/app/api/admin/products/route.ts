import { NextResponse } from "next/server";
import { createAdminProduct, getAdminProductsTable } from "@/lib/repositories/admin";

export async function GET() {
  const products = await getAdminProductsTable();
  return NextResponse.json({ items: products });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["name", "slug", "type", "gender", "variant"];
    for (const field of required) {
      if (!body?.[field]) {
        return NextResponse.json({ message: `${field} is required` }, { status: 400 });
      }
    }

    const product = await createAdminProduct({
      name: body.name,
      slug: body.slug,
      type: body.type,
      gender: body.gender,
      productTypeId: body.productTypeId,
      description: body.description,
      shortDescription: body.shortDescription,
      ageFromMonths: body.ageFromMonths ?? null,
      ageToMonths: body.ageToMonths ?? null,
      isNew: body.isNew,
      isBestSeller: body.isBestSeller,
      isOnSale: body.isOnSale,
      salePercent: body.salePercent,
      isActive: body.isActive,
      categoryId: body.categoryId,
      variant: {
        size: body.variant.size ?? "One Size",
        color: body.variant.color ?? "Multicolor",
        retailPrice: Number(body.variant.retailPrice ?? 0),
        wholesalePrice: body.variant.wholesalePrice ? Number(body.variant.wholesalePrice) : null,
        stock: body.variant.stock ?? 0,
      },
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
