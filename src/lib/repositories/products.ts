import { Prisma, ProductVariant } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    variants: true;
    media: true;
  };
}>;

type CategoryWithProducts = Prisma.CategoryGetPayload<{
  include: {
    products: {
      include: {
        variants: true;
        media: true;
      };
    };
  };
}>;

export async function getAllCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryWithProducts(slug: string): Promise<CategoryWithProducts | null> {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: { variants: true, media: true },
      },
    },
  });
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: true,
      media: true,
    },
  });
}

export async function getVariantsByProductId(productId: string): Promise<ProductVariant[]> {
  return prisma.productVariant.findMany({
    where: { productId },
    orderBy: [{ size: "asc" }, { color: "asc" }],
  });
}
