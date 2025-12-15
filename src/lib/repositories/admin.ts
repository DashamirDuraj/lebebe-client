import { DeliveryStatus, OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const toNumber = (value: Prisma.Decimal | number | null | undefined) =>
  value ? Number(value) : 0;

export async function getAdminRevenueSummary() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const startOfMonth = new Date(now);
  startOfMonth.setDate(startOfMonth.getDate() - 30);

  const [daily, weekly, monthly, monthlyExpenses, deliveryStats] = await prisma.$transaction([
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: OrderStatus.CONFIRMED, createdAt: { gte: startOfDay } },
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: OrderStatus.CONFIRMED, createdAt: { gte: startOfWeek } },
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: OrderStatus.CONFIRMED, createdAt: { gte: startOfMonth } },
    }),
    prisma.shopExpense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: startOfMonth } },
    }),
    prisma.order.groupBy({
      by: ["deliveryStatus"],
      _count: true,
    }),
  ]);

  const delivered = deliveryStats.find((d) => d.deliveryStatus === DeliveryStatus.DELIVERED)?._count ?? 0;
  const undelivered =
    deliveryStats.filter((d) => d.deliveryStatus !== DeliveryStatus.DELIVERED).reduce((sum, d) => sum + d._count, 0);

  return {
    dailyRevenue: toNumber(daily._sum.totalAmount),
    weeklyRevenue: toNumber(weekly._sum.totalAmount),
    monthlyRevenue: toNumber(monthly._sum.totalAmount),
    monthlyExpenses: toNumber(monthlyExpenses._sum.amount),
    monthlyNetProfit: toNumber(monthly._sum.totalAmount) - toNumber(monthlyExpenses._sum.amount),
    deliveredOrders: delivered,
    undeliveredOrders: undelivered,
  };
}

export async function getAdminProductsTable() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      productType: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => {
    const totalQty = product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
    const expectedRevenue = product.variants.reduce(
      (sum, v) => sum + toNumber(v.retailPrice) * (v.stock ?? 0),
      0,
    );
    const inventoryCost = product.variants.reduce(
      (sum, v) => sum + toNumber(v.wholesalePrice) * (v.stock ?? 0),
      0,
    );

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      type: product.productType?.name || product.type,
      sizes: product.variants.map((v) => v.size).join(", "),
      availableQty: totalQty,
      expectedRevenue,
      inventoryCost,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      isOnSale: product.isOnSale,
      salePercent: product.salePercent,
      isActive: product.isActive,
    };
  });
}

export async function getAdminOrdersTable() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
    },
    take: 100,
  });

  return orders.map((o) => ({
    id: o.id,
    client: o.customer
      ? `${o.customer.firstName ?? ""} ${o.customer.lastName ?? ""}`.trim()
      : `${o.firstName} ${o.lastName}`.trim(),
    address: o.address,
    city: o.city,
    phone: o.phone,
    deliveryStatus: o.deliveryStatus,
  }));
}

export async function getAdminClientsTable() {
  const customers = await prisma.customer.findMany({
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
      },
    },
    take: 100,
  });

  return customers.map((c) => ({
    id: c.id,
    name: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || c.email,
    email: c.email,
    totalSpent: c.orders.reduce((sum, o) => sum + toNumber(o.totalAmount), 0),
    orders: c.orders.map((o) => ({
      id: o.id,
      date: o.createdAt.toISOString().split("T")[0],
      amount: toNumber(o.totalAmount),
      source: o.source,
    })),
  }));
}

export async function getAdminExpensesTable() {
  const expenses = await prisma.shopExpense.findMany({
    orderBy: { date: "desc" },
    take: 100,
  });

  return expenses.map((e) => ({
    id: e.id,
    category: e.category,
    description: e.description,
    amount: toNumber(e.amount),
    currency: e.currency,
    quantity: e.quantity ?? undefined,
    unit: e.unit ?? undefined,
    date: e.date.toISOString().split("T")[0],
  }));
}

type CreateProductInput = {
  name: string;
  slug: string;
  type?: string;
  productTypeId?: string | null;
  gender: "GIRL" | "BOY" | "NEWBORN" | "UNISEX";
  description?: string;
  shortDescription?: string;
  ageFromMonths?: number | null;
  ageToMonths?: number | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  salePercent?: number | null;
  isActive?: boolean;
  categoryId?: string | null;
  variant: {
    size: string;
    color: string;
    retailPrice: number;
    wholesalePrice?: number | null;
    stock?: number;
  };
};

export async function createAdminProduct(data: CreateProductInput) {
  let typeName = data.type;
  if (!typeName && data.productTypeId) {
    const productType = await prisma.productType.findUnique({
      where: { id: data.productTypeId },
      select: { name: true },
    });
    typeName = productType?.name || "General";
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      type: typeName ?? "General",
      productTypeId: data.productTypeId ?? null,
      gender: data.gender,
      description: data.description ?? null,
      shortDescription: data.shortDescription ?? null,
      ageFromMonths: data.ageFromMonths ?? null,
      ageToMonths: data.ageToMonths ?? null,
      isNew: data.isNew ?? false,
      isBestSeller: data.isBestSeller ?? false,
      isOnSale: data.isOnSale ?? false,
      salePercent: data.salePercent ?? null,
      isActive: data.isActive ?? true,
      categoryId: data.categoryId ?? null,
      variants: {
        create: {
          size: data.variant.size,
          color: data.variant.color,
          retailPrice: new Prisma.Decimal(data.variant.retailPrice),
          wholesalePrice: data.variant.wholesalePrice
            ? new Prisma.Decimal(data.variant.wholesalePrice)
            : null,
          stock: data.variant.stock ?? 0,
        },
      },
    },
    include: {
      variants: true,
    },
  });

  return product;
}

export async function getAdminProductTypes() {
  return prisma.productType.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createAdminProductType(name: string, slug: string) {
  return prisma.productType.create({
    data: {
      name,
      slug,
    },
  });
}

export async function deleteAdminProductType(id: string) {
  return prisma.productType.delete({
    where: { id },
  });
}

export async function updateAdminProductBasics(
  id: string,
  data: {
    name?: string;
    slug?: string;
    type?: string;
    productTypeId?: string | null;
    isNew?: boolean;
    isBestSeller?: boolean;
    isOnSale?: boolean;
    salePercent?: number | null;
    isActive?: boolean;
    variant?: {
      retailPrice?: number | null;
      wholesalePrice?: number | null;
      stock?: number | null;
      size?: string | null;
      color?: string | null;
    };
  },
) {
  let typeName = data.type;
  if (!typeName && data.productTypeId) {
    const productType = await prisma.productType.findUnique({
      where: { id: data.productTypeId },
      select: { name: true },
    });
    typeName = productType?.name || undefined;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        type: typeName,
        productTypeId: data.productTypeId ?? undefined,
        isNew: data.isNew,
        isBestSeller: data.isBestSeller,
        isOnSale: data.isOnSale,
        salePercent: data.salePercent ?? null,
        isActive: data.isActive,
      },
    });

    if (data.variant) {
      const existingVariant = await tx.productVariant.findFirst({
        where: { productId: id },
        orderBy: { createdAt: "asc" },
      });

      if (existingVariant) {
        await tx.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            retailPrice:
              data.variant.retailPrice != null
                ? new Prisma.Decimal(data.variant.retailPrice)
                : undefined,
            wholesalePrice:
              data.variant.wholesalePrice != null
                ? new Prisma.Decimal(data.variant.wholesalePrice)
                : undefined,
            stock: data.variant.stock ?? undefined,
            size: data.variant.size ?? undefined,
            color: data.variant.color ?? undefined,
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId: id,
            size: data.variant.size ?? "One Size",
            color: data.variant.color ?? "Multicolor",
            retailPrice: new Prisma.Decimal(data.variant.retailPrice ?? 0),
            wholesalePrice:
              data.variant.wholesalePrice != null
                ? new Prisma.Decimal(data.variant.wholesalePrice)
                : null,
            stock: data.variant.stock ?? 0,
          },
        });
      }
    }

    return tx.product.findUnique({
      where: { id: product.id },
      include: {
        variants: true,
        productType: true,
      },
    });
  });

  if (!updated) {
    throw new Error("Product not found after update");
  }

  const totalQty = updated.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
  const expectedRevenue = updated.variants.reduce(
    (sum, v) => sum + toNumber(v.retailPrice) * (v.stock ?? 0),
    0,
  );
  const inventoryCost = updated.variants.reduce(
    (sum, v) => sum + toNumber(v.wholesalePrice) * (v.stock ?? 0),
    0,
  );

  return {
    id: updated.id,
    name: updated.name,
    type: updated.productType?.name || updated.type,
    slug: updated.slug,
    sizes: updated.variants.map((v) => v.size).join(", "),
    availableQty: totalQty,
    expectedRevenue,
    inventoryCost,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    isNew: updated.isNew,
    isBestSeller: updated.isBestSeller,
    isOnSale: updated.isOnSale,
    salePercent: updated.salePercent,
    isActive: updated.isActive,
  };
}

export async function deleteAdminProduct(id: string) {
  if (!id) {
    throw new Error("Missing product id");
  }

  return prisma.$transaction(async (tx) => {
    const orderItems = await tx.orderItem.count({ where: { productId: id } });
    if (orderItems > 0) {
      throw new Error("Cannot delete a product that has existing orders");
    }

    await tx.inventoryMovement.deleteMany({
      where: {
        variant: { productId: id },
      },
    });
    await tx.productMedia.deleteMany({ where: { productId: id } });
    await tx.productVariant.deleteMany({ where: { productId: id } });
    await tx.product.delete({ where: { id } });

    return { success: true };
  });
}

export async function getAdminProductDetail(id: string) {
  if (!id) return null;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      productType: true,
      variants: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!product) return null;

  const variant = product.variants[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    type: product.productType?.name || product.type,
    productTypeId: product.productTypeId ?? "",
    gender: product.gender,
    retailPrice: variant ? toNumber(variant.retailPrice) : 0,
    wholesalePrice: variant ? toNumber(variant.wholesalePrice) : 0,
    stock: variant?.stock ?? 0,
    ageFromMonths: product.ageFromMonths ?? 0,
    ageToMonths: product.ageToMonths ?? 0,
    color: variant?.color ?? "Multicolor",
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    isOnSale: product.isOnSale,
    salePercent: product.salePercent ?? 0,
    isActive: product.isActive,
  };
}
