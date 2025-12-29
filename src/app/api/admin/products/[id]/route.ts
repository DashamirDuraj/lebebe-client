import { NextResponse } from "next/server";
import {
  deleteAdminProduct,
  getAdminProductDetail,
  updateAdminProductBasics,
} from "@/lib/repositories/admin";

type Params = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing product id" }, { status: 400 });
    }

    const product = await getAdminProductDetail(id);
    if (!product) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Admin product detail error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to fetch product" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing product id" }, { status: 400 });
    }

    const body = await request.json();
    const updated = await updateAdminProductBasics(id, {
      name: body.name,
      slug: body.slug,
      type: body.type,
      productTypeId: body.productTypeId,
      isNew: body.isNew,
      isBestSeller: body.isBestSeller,
      isOnSale: body.isOnSale,
      salePercent: body.salePercent,
      isActive: body.isActive,
      inventoryBatchId: body.inventoryBatchId ?? null,
      variants: Array.isArray(body.variants)
        ? body.variants.map((variant: any) => ({
            id: variant.id,
            sizeFromMonths: Number(variant.sizeFromMonths ?? 0),
            sizeToMonths: Number(variant.sizeToMonths ?? 0),
            color: variant.color ?? "Multicolor",
            retailPrice: Number(variant.retailPrice ?? 0),
            wholesalePrice: variant.wholesalePrice != null ? Number(variant.wholesalePrice) : null,
            stock: Number(variant.stock ?? 0),
            addStock: Number(variant.addStock ?? 0),
          }))
        : undefined,
      advertisingSpend:
        body.advertisingSpend != null && body.advertisingSpend !== ""
          ? Number(body.advertisingSpend)
          : null,
      media: Array.isArray(body.media)
        ? body.media.map((m: any) => ({
            url: m.url,
            type: m.type,
            altText: m.altText,
            isThumbnail: m.isThumbnail,
          }))
        : undefined,
    });
    return NextResponse.json({ product: updated });
  } catch (error: any) {
    console.error("Update product error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to update product" },
      { status: 400 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing product id" }, { status: 400 });
    }
    await deleteAdminProduct(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete product error", error);
    return NextResponse.json(
      { message: error?.message || "Unable to delete product" },
      { status: 400 },
    );
  }
}
