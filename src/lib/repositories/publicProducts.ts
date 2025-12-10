import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

type PublicMedia = {
  url: string;
  type: "IMAGE" | "VIDEO";
  position: number;
  altText: string | null;
};

type PublicVariant = {
  id: string;
  size: string;
  color: string;
  isAvailable: boolean;
};

type PublicProductListItem = {
  id: string;
  slug: string;
  name: string;
  gender: string;
  shortDescription: string | null;
  type: string;
  ageFromMonths: number | null;
  ageToMonths: number | null;
  salePercent: number | null;
  badges: string[];
  retailPrice: number;
  category: PublicCategory | null;
  mainImage: PublicMedia | null;
};

type PublicProductDetail = {
  id: string;
  slug: string;
  name: string;
  gender: string;
  description: string | null;
  shortDescription: string | null;
  type: string;
  ageFromMonths: number | null;
  ageToMonths: number | null;
  category: PublicCategory | null;
  salePercent: number | null;
  isNew: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  badges: string[];
  retailPrice: number;
  variants: PublicVariant[];
  media: PublicMedia[];
};

type ProductListParams = {
  categorySlug?: string;
  tag?: string;
  search?: string;
  gender?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
};

export async function getPublicCategories(): Promise<PublicCategory[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      sortOrder: true,
      isActive: true,
    },
  });

  return categories;
}

const publicProductSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  shortDescription: true,
  gender: true,
  type: true,
  ageFromMonths: true,
  ageToMonths: true,
  isActive: true,
  isNew: true,
  isBestSeller: true,
  isOnSale: true,
  salePercent: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      sortOrder: true,
      isActive: true,
    },
  },
  variants: {
    select: {
      id: true,
      size: true,
      color: true,
      stock: true,
      retailPrice: true,
    },
  },
  media: {
    orderBy: { position: "asc" },
    select: {
      url: true,
      type: true,
      position: true,
      altText: true,
    },
  },
} satisfies Prisma.ProductSelect;

function mapToPublicListItem(product: Prisma.ProductGetPayload<{ select: typeof publicProductSelect }>): PublicProductListItem {
  const mainImage = product.media[0]
    ? {
        url: product.media[0].url,
        type: product.media[0].type,
        position: product.media[0].position,
        altText: product.media[0].altText,
      }
    : null;

  const retailPrice = product.variants[0]?.retailPrice
    ? Number(product.variants[0].retailPrice)
    : 0;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    gender: product.gender,
    shortDescription: product.shortDescription ?? product.description ?? null,
    type: product.type,
    ageFromMonths: product.ageFromMonths ?? null,
    ageToMonths: product.ageToMonths ?? null,
    salePercent: product.isOnSale ? product.salePercent ?? null : null,
    badges: [
      ...(product.isNew ? ["new"] : []),
      ...(product.isBestSeller ? ["bestSeller"] : []),
      ...(product.isOnSale ? ["sale"] : []),
    ],
    retailPrice,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
          sortOrder: product.category.sortOrder,
          isActive: product.category.isActive,
        }
      : null,
    mainImage,
  };
}

function mapToPublicDetail(product: Prisma.ProductGetPayload<{ select: typeof publicProductSelect }>): PublicProductDetail {
  const retailPrice = product.variants[0]?.retailPrice
    ? Number(product.variants[0].retailPrice)
    : 0;

  const variants: PublicVariant[] = product.variants.map((variant) => ({
    id: variant.id,
    size: variant.size,
    color: variant.color,
    isAvailable: (variant.stock ?? 0) > 0,
  }));

  const media: PublicMedia[] = product.media.map((m) => ({
    url: m.url,
    type: m.type,
    position: m.position,
    altText: m.altText,
  }));

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    gender: product.gender,
    description: product.description ?? null,
    shortDescription: product.shortDescription ?? null,
    type: product.type,
    ageFromMonths: product.ageFromMonths ?? null,
    ageToMonths: product.ageToMonths ?? null,
    salePercent: product.isOnSale ? product.salePercent ?? null : null,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    isOnSale: product.isOnSale,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
          sortOrder: product.category.sortOrder,
          isActive: product.category.isActive,
        }
      : null,
    badges: [
      ...(product.isNew ? ["new"] : []),
      ...(product.isBestSeller ? ["bestSeller"] : []),
      ...(product.isOnSale ? ["sale"] : []),
    ],
    retailPrice,
    variants,
    media,
  };
}

export async function getPublicProducts(params: ProductListParams) {
  const tags = params.tags?.length
    ? params.tags
    : params.tag
      ? [params.tag]
      : [];
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 12;
  const skip = (page - 1) * pageSize;

  const tagFilters: Prisma.ProductWhereInput[] = [];
  tags.forEach((tag) => {
    if (tag === "new") tagFilters.push({ isNew: true });
    if (tag === "best-seller") tagFilters.push({ isBestSeller: true });
    if (tag === "sale") tagFilters.push({ isOnSale: true });
  });

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" } },
            { description: { contains: params.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(params.categorySlug
      ? {
          category: { slug: params.categorySlug, isActive: true },
        }
      : {}),
    ...(params.gender
      ? {
          gender: params.gender as any,
        }
      : {}),
    ...(tagFilters.length ? { OR: tagFilters } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput[] = tags.includes("best-seller")
    ? [{ isBestSeller: "desc" }, { createdAt: "desc" }]
    : [{ createdAt: "desc" }];

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: publicProductSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(mapToPublicListItem),
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPublicProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    select: publicProductSelect,
  });

  if (!product) return null;
  return mapToPublicDetail(product);
}

export async function searchPublicProducts(query: string) {
  if (!query.trim()) return [];

  const results = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      slug: true,
      name: true,
      variants: { select: { retailPrice: true } },
      media: {
        orderBy: { position: "asc" },
        select: { url: true, type: true, position: true, altText: true },
      },
    },
  });

  return results.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    retailPrice: product.variants[0]?.retailPrice
      ? Number(product.variants[0].retailPrice)
      : 0,
    thumbnail: product.media[0]
      ? {
          url: product.media[0].url,
          type: product.media[0].type,
          position: product.media[0].position,
          altText: product.media[0].altText,
        }
      : null,
  }));
}
