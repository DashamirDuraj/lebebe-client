import {
  DeliveryStatus,
  ExpenseCategory,
  InventoryMovementType,
  OrderStatus,
  Prisma,
} from "@prisma/client";
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

export async function getAdminOrderProductOptions() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return variants.map((variant) => ({
    variantId: variant.id,
    productId: variant.productId,
    productName: variant.product?.name ?? "Product",
    size: variant.size,
    color: variant.color,
    price: toNumber(variant.retailPrice),
  }));
}

type AdminOrderInput = {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  address: string;
  city: string;
  postalCode?: string | null;
  notes?: string | null;
  paymentType: Prisma.PaymentType;
  source: Prisma.OrderSource;
  status: Prisma.OrderStatus;
  deliveryStatus: Prisma.DeliveryStatus;
  items: {
    variantId: string;
    quantity: number;
  }[];
};

export async function createAdminOrder(data: AdminOrderInput) {
  if (!data.items?.length) {
    throw new Error("At least one item is required");
  }

  const existingCustomer = await prisma.customer.findFirst({
    where: { phone: data.phone },
  });

  const normalizedItems = data.items.reduce<Record<string, number>>((acc, item) => {
    if (!item.variantId) return acc;
    const quantity = Number(item.quantity ?? 0);
    if (quantity <= 0) return acc;
    acc[item.variantId] = (acc[item.variantId] ?? 0) + quantity;
    return acc;
  }, {});

  const variantIds = Object.keys(normalizedItems);
  if (variantIds.length === 0) {
    throw new Error("At least one valid item is required");
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  if (variants.length !== variantIds.length) {
    throw new Error("One or more variants are invalid");
  }

  const orderItems = variants.map((variant) => ({
    productId: variant.productId,
    variantId: variant.id,
    quantity: normalizedItems[variant.id],
    unitPrice: variant.retailPrice,
  }));

  const totalAmount = orderItems.reduce((sum, item) => {
    return sum + Number(item.unitPrice) * item.quantity;
  }, 0);

  const customerConnect = existingCustomer
    ? { connect: { id: existingCustomer.id } }
    : data.email && data.email.trim().length > 0
      ? {
          connectOrCreate: {
            where: { email: data.email },
            create: {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
            },
          },
        }
      : undefined;

  return prisma.$transaction(async (tx) => {
    if (data.status === "CONFIRMED") {
      for (const variant of variants) {
        const qty = normalizedItems[variant.id];
        if (variant.stock < qty) {
          throw new Error(`Insufficient stock for ${variant.product?.name ?? "variant"}`);
        }
      }
    }

    const order = await tx.order.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email ?? null,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode ?? null,
        notes: data.notes ?? null,
        paymentType: data.paymentType,
        source: data.source,
        status: data.status,
        deliveryStatus: data.deliveryStatus,
        totalAmount: new Prisma.Decimal(totalAmount),
        currency: "ALL",
        otpHash: null,
        otpExpiresAt: null,
        otpAttempts: 0,
        ...(customerConnect ? { customer: customerConnect } : {}),
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });

    if (data.status === "CONFIRMED") {
      for (const item of orderItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            movementType: InventoryMovementType.REMOVE,
            quantity: item.quantity,
            unitCost: null,
            currency: "ALL",
            orderId: order.id,
            note: "Manual order",
          },
        });
      }
    }

    return order;
  });
}

export async function getAdminOrderDetail(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) return null;

  return {
    id: order.id,
    firstName: order.firstName,
    lastName: order.lastName,
    email: order.email ?? "",
    phone: order.phone,
    address: order.address,
    city: order.city,
    postalCode: order.postalCode ?? "",
    notes: order.notes ?? "",
    totalAmount: toNumber(order.totalAmount),
    paymentType: order.paymentType,
    source: order.source,
    status: order.status,
    deliveryStatus: order.deliveryStatus,
    items: order.items.map((item) => ({
      variantId: item.variantId ?? "",
      quantity: item.quantity,
    })),
  };
}

export async function updateAdminOrder(id: string, data: AdminOrderInput) {
  if (!data.items?.length) {
    throw new Error("At least one item is required");
  }

  const normalizedItems = data.items.reduce<Record<string, number>>((acc, item) => {
    if (!item.variantId) return acc;
    const quantity = Number(item.quantity ?? 0);
    if (quantity <= 0) return acc;
    acc[item.variantId] = (acc[item.variantId] ?? 0) + quantity;
    return acc;
  }, {});

  const variantIds = Object.keys(normalizedItems);
  if (variantIds.length === 0) {
    throw new Error("At least one valid item is required");
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  if (variants.length !== variantIds.length) {
    throw new Error("One or more variants are invalid");
  }

  const orderItems = variants.map((variant) => ({
    productId: variant.productId,
    variantId: variant.id,
    quantity: normalizedItems[variant.id],
    unitPrice: variant.retailPrice,
  }));

  const totalAmount = orderItems.reduce((sum, item) => {
    return sum + Number(item.unitPrice) * item.quantity;
  }, 0);

  const customerConnect =
    data.email && data.email.trim().length > 0
      ? {
          connectOrCreate: {
            where: { email: data.email },
            create: {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
            },
          },
        }
      : undefined;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new Error("Order not found");
    }

    const oldConfirmed = existing.status === "CONFIRMED";
    const newConfirmed = data.status === "CONFIRMED";

    const oldMap = existing.items.reduce<Record<string, number>>((acc, item) => {
      if (!item.variantId) return acc;
      acc[item.variantId] = (acc[item.variantId] ?? 0) + item.quantity;
      return acc;
    }, {});

    if (newConfirmed) {
      for (const variant of variants) {
        const oldQty = oldConfirmed ? oldMap[variant.id] ?? 0 : 0;
        const newQty = normalizedItems[variant.id] ?? 0;
        const diff = newQty - oldQty;
        if (diff > 0 && variant.stock < diff) {
          throw new Error(`Insufficient stock for ${variant.product?.name ?? "variant"}`);
        }
      }
    }

    await tx.orderItem.deleteMany({ where: { orderId: id } });
    await tx.orderItem.createMany({
      data: orderItems.map((item) => ({
        orderId: id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });

    if (oldConfirmed && !newConfirmed) {
      for (const [variantId, qty] of Object.entries(oldMap)) {
        await tx.productVariant.update({
          where: { id: variantId },
          data: { stock: { increment: qty } },
        });
        await tx.inventoryMovement.create({
          data: {
            variantId,
            movementType: InventoryMovementType.ADD,
            quantity: qty,
            unitCost: null,
            currency: "ALL",
            orderId: id,
            note: "Order reverted",
          },
        });
      }
    } else if (!oldConfirmed && newConfirmed) {
      for (const item of orderItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            movementType: InventoryMovementType.REMOVE,
            quantity: item.quantity,
            unitCost: null,
            currency: "ALL",
            orderId: id,
            note: "Order confirmed",
          },
        });
      }
    } else if (oldConfirmed && newConfirmed) {
      const allVariantIds = new Set([...Object.keys(oldMap), ...variantIds]);
      for (const variantId of allVariantIds) {
        const oldQty = oldMap[variantId] ?? 0;
        const newQty = normalizedItems[variantId] ?? 0;
        const diff = newQty - oldQty;
        if (diff === 0) continue;
        await tx.productVariant.update({
          where: { id: variantId },
          data: diff > 0 ? { stock: { decrement: diff } } : { stock: { increment: -diff } },
        });
        await tx.inventoryMovement.create({
          data: {
            variantId,
            movementType: diff > 0 ? InventoryMovementType.REMOVE : InventoryMovementType.ADD,
            quantity: Math.abs(diff),
            unitCost: null,
            currency: "ALL",
            orderId: id,
            note: "Order updated",
          },
        });
      }
    }

    return tx.order.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email ?? null,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode ?? null,
        notes: data.notes ?? null,
        paymentType: data.paymentType,
        source: data.source,
        status: data.status,
        deliveryStatus: data.deliveryStatus,
        totalAmount: new Prisma.Decimal(totalAmount),
        currency: "ALL",
        ...(customerConnect ? { customer: customerConnect } : {}),
      },
    });
  });
}

export async function deleteAdminOrder(id: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "CONFIRMED") {
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            movementType: InventoryMovementType.ADD,
            quantity: item.quantity,
            unitCost: null,
            currency: "ALL",
            note: "Order deleted",
          },
        });
      }
    }

    await tx.inventoryMovement.deleteMany({ where: { orderId: id } });
    await tx.orderItem.deleteMany({ where: { orderId: id } });
    await tx.order.delete({ where: { id } });

    return { success: true };
  });
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
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  salePercent?: number | null;
  isActive?: boolean;
  categoryId?: string | null;
  inventoryBatchId?: string | null;
  variants: {
    id?: string;
    sizeFromMonths: number;
    sizeToMonths: number;
    color: string;
    retailPrice: number;
    wholesalePrice?: number | null;
    stock?: number;
  }[];
  media?: {
    url: string;
    type: "IMAGE" | "VIDEO";
    altText?: string | null;
    isThumbnail?: boolean;
  }[];
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

  if (!data.variants || data.variants.length === 0) {
    throw new Error("At least one variant is required");
  }

  const hasStock = data.variants.some((variant) => (variant.stock ?? 0) > 0);
  if (hasStock && !data.inventoryBatchId) {
    throw new Error("Inventory batch is required when stock is provided");
  }

  const normalizedVariants = data.variants.map((variant) => ({
    size: `${variant.sizeFromMonths}-${variant.sizeToMonths}M`,
    color: variant.color,
    retailPrice: new Prisma.Decimal(variant.retailPrice),
    wholesalePrice:
      variant.wholesalePrice != null ? new Prisma.Decimal(variant.wholesalePrice) : null,
    stock: variant.stock ?? 0,
  }));

  const ageFromMonths = Math.min(...data.variants.map((v) => v.sizeFromMonths));
  const ageToMonths = Math.max(...data.variants.map((v) => v.sizeToMonths));

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: typeName ?? "General",
        productTypeId: data.productTypeId ?? null,
        gender: data.gender,
        description: data.description ?? null,
        shortDescription: data.shortDescription ?? null,
        ageFromMonths,
        ageToMonths,
        isNew: data.isNew ?? false,
        isBestSeller: data.isBestSeller ?? false,
        isOnSale: data.isOnSale ?? false,
        salePercent: data.salePercent ?? null,
        isActive: data.isActive ?? true,
        categoryId: data.categoryId ?? null,
        variants: {
          create: normalizedVariants,
        },
        media: data.media
          ? {
              create: (() => {
                const media = [...data.media];
                const thumbnailIdx = media.findIndex((m) => m.isThumbnail);
                if (thumbnailIdx > -1) {
                  const [thumb] = media.splice(thumbnailIdx, 1);
                  media.unshift(thumb);
                }
                return media.map((m, index) => ({
                  url: m.url,
                  type: m.type,
                  position: index,
                  altText: m.altText ?? null,
                }));
              })(),
            }
          : undefined,
      },
      include: {
        variants: true,
      },
    });

    if (data.inventoryBatchId) {
      for (const variant of created.variants) {
        if ((variant.stock ?? 0) > 0) {
          await tx.inventoryMovement.create({
            data: {
              variantId: variant.id,
              movementType: InventoryMovementType.ADD,
              quantity: variant.stock ?? 0,
              unitCost: null,
              currency: "ALL",
              inventoryBatchId: data.inventoryBatchId,
              note: "Initial stock",
            },
          });
        }
      }
    }

    return created;
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

export async function getAdminInventoryBatches() {
  const batches = await prisma.inventoryBatch.findMany({
    orderBy: { receivedAt: "desc" },
  });

  return batches.map((batch) => ({
    id: batch.id,
    title: batch.title,
    receivedAt: batch.receivedAt.toISOString().split("T")[0],
  }));
}

export async function createAdminInventoryBatch(title: string, receivedAt: string) {
  const date = new Date(receivedAt);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid received date");
  }

  return prisma.inventoryBatch.create({
    data: {
      title,
      receivedAt: date,
    },
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
    inventoryBatchId?: string | null;
    variants?: {
      id?: string;
      sizeFromMonths: number;
      sizeToMonths: number;
      color: string;
      retailPrice: number;
      wholesalePrice?: number | null;
      stock?: number;
      addStock?: number;
    }[];
    advertisingSpend?: number | null;
    media?: {
      url: string;
      type: "IMAGE" | "VIDEO";
      altText?: string | null;
      isThumbnail?: boolean;
    }[];
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
    const ageFromMonths =
      data.variants && data.variants.length > 0
        ? Math.min(...data.variants.map((v) => v.sizeFromMonths))
        : undefined;
    const ageToMonths =
      data.variants && data.variants.length > 0
        ? Math.max(...data.variants.map((v) => v.sizeToMonths))
        : undefined;

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
        ageFromMonths,
        ageToMonths,
      },
    });

    if (data.variants) {
      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id },
      });
      const incomingIds = new Set(data.variants.map((v) => v.id).filter(Boolean));

      for (const variant of data.variants) {
        const size = `${variant.sizeFromMonths}-${variant.sizeToMonths}M`;
        if (variant.id) {
          const addStock = variant.addStock ?? 0;
          if (addStock > 0 && !data.inventoryBatchId) {
            throw new Error("Inventory batch is required for new stock");
          }

          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              size,
              color: variant.color,
              retailPrice: new Prisma.Decimal(variant.retailPrice),
              wholesalePrice:
                variant.wholesalePrice != null
                  ? new Prisma.Decimal(variant.wholesalePrice)
                  : null,
              stock: addStock > 0 ? { increment: addStock } : undefined,
            },
          });

          if (addStock > 0 && data.inventoryBatchId) {
            await tx.inventoryMovement.create({
              data: {
                variantId: variant.id,
                movementType: InventoryMovementType.ADD,
                quantity: addStock,
                unitCost: null,
                currency: "ALL",
                inventoryBatchId: data.inventoryBatchId,
                note: "Manual stock add",
              },
            });
          }
        } else {
          if (!data.inventoryBatchId && (variant.stock ?? 0) > 0) {
            throw new Error("Inventory batch is required for new stock");
          }
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: id,
              size,
              color: variant.color,
              retailPrice: new Prisma.Decimal(variant.retailPrice),
              wholesalePrice:
                variant.wholesalePrice != null
                  ? new Prisma.Decimal(variant.wholesalePrice)
                  : null,
              stock: variant.stock ?? 0,
            },
          });

          if (data.inventoryBatchId && (variant.stock ?? 0) > 0) {
            await tx.inventoryMovement.create({
              data: {
                variantId: createdVariant.id,
                movementType: InventoryMovementType.ADD,
                quantity: variant.stock ?? 0,
                unitCost: null,
                currency: "ALL",
                inventoryBatchId: data.inventoryBatchId,
                note: "New variant stock",
              },
            });
          }
        }
      }

      const toDelete = existingVariants.filter((v) => !incomingIds.has(v.id));
      for (const variant of toDelete) {
        const orderItems = await tx.orderItem.count({ where: { variantId: variant.id } });
        if (orderItems > 0) {
          throw new Error("Cannot delete a variant that has existing orders");
        }
        await tx.inventoryMovement.deleteMany({ where: { variantId: variant.id } });
        await tx.productVariant.delete({ where: { id: variant.id } });
      }
    }

    if (data.media) {
      const media = [...data.media];
      const thumbnailIdx = media.findIndex((m) => m.isThumbnail);
      if (thumbnailIdx > -1) {
        const [thumb] = media.splice(thumbnailIdx, 1);
        media.unshift(thumb);
      }

      await tx.productMedia.deleteMany({ where: { productId: id } });
      if (media.length > 0) {
        await tx.productMedia.createMany({
          data: media.map((m, index) => ({
            productId: id,
            url: m.url,
            type: m.type,
            position: index,
            altText: m.altText ?? null,
          })),
        });
      }
    }

    if (data.advertisingSpend && data.advertisingSpend > 0) {
      await tx.shopExpense.create({
        data: {
          category: ExpenseCategory.ADS,
          amount: new Prisma.Decimal(data.advertisingSpend),
          currency: "ALL",
          productId: id,
          description: `Advertising for ${product.name}`,
        },
      });
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
    await tx.shopExpense.deleteMany({ where: { productId: id } });
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
      media: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!product) return null;

  const parseSizeRange = (size: string) => {
    const match = size.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      return { from: Number(match[1]), to: Number(match[2]) };
    }
    const single = size.match(/(\d+)/);
    if (single) {
      const value = Number(single[1]);
      return { from: value, to: value };
    }
    return { from: 0, to: 0 };
  };

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    type: product.productType?.name || product.type,
    productTypeId: product.productTypeId ?? "",
    gender: product.gender,
    variants: product.variants.map((variant) => {
      const range = parseSizeRange(variant.size);
      return {
        id: variant.id,
        sizeFromMonths: range.from,
        sizeToMonths: range.to,
        color: variant.color,
        stock: variant.stock ?? 0,
        retailPrice: toNumber(variant.retailPrice),
        wholesalePrice: toNumber(variant.wholesalePrice),
      };
    }),
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    isOnSale: product.isOnSale,
    salePercent: product.salePercent ?? 0,
    isActive: product.isActive,
    media: product.media.map((m) => ({
      id: m.id,
      url: m.url,
      type: m.type,
      altText: m.altText ?? "",
    })),
  };
}
