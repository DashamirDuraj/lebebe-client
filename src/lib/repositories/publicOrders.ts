import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const OTP_EXPIRY_MINUTES = 10;

type CartItemInput = {
  variantId: string;
  quantity: number;
};

type CreateOrderInput = {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  address: string;
  city: string;
  postalCode?: string | null;
  notes?: string | null;
  paymentType?: Prisma.PaymentType;
  source?: Prisma.OrderSource;
  items: CartItemInput[];
};

function generateOtpCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return String(code);
}

function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

async function sendOtpSms(phone: string, otpCode: string) {
  // Placeholder SMS integration; replace with provider call.
  console.info(`Sending OTP ${otpCode} to ${phone}`);
}

export async function createOrderWithOtp(input: CreateOrderInput) {
  if (!input.items?.length) {
    throw new Error("Cart is empty");
  }

  const variantIds = input.items.map((item) => item.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  if (variants.length !== variantIds.length) {
    throw new Error("One or more variants are invalid");
  }

  const otpCode = generateOtpCode();
  const otpHash = hashOtp(otpCode);
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Calculate totals and prepare order items
  const orderItemsData = input.items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant || !variant.product?.isActive) {
      throw new Error("Product or variant is not available");
    }
    if (item.quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    return {
      variant,
      quantity: item.quantity,
      unitPrice: variant.retailPrice,
    };
  });

  const totalAmount = orderItemsData.reduce((sum, item) => {
    return sum + Number(item.unitPrice) * item.quantity;
  }, 0);

  const customerConnect =
    input.email && input.email.trim().length > 0
      ? {
          connectOrCreate: {
            where: { email: input.email },
            create: {
              email: input.email,
              firstName: input.firstName,
              lastName: input.lastName,
              phone: input.phone,
            },
          },
        }
      : undefined;

  const order = await prisma.order.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      city: input.city,
      postalCode: input.postalCode,
      notes: input.notes,
      paymentType: input.paymentType ?? "CASH_ON_DELIVERY",
      source: input.source ?? "WEBSITE",
      totalAmount: new Prisma.Decimal(totalAmount),
      currency: "EUR",
      otpHash,
      otpExpiresAt,
      otpAttempts: 0,
      ...(customerConnect ? { customer: customerConnect } : {}),
      items: {
        create: orderItemsData.map((item) => ({
          productId: item.variant.productId,
          variantId: item.variant.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    select: { id: true },
  });

  await sendOtpSms(input.phone, otpCode);

  return { orderId: order.id };
}

export async function verifyOrderOtp(orderId: string, otpCode: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: true,
        },
      },
    },
  });

  if (!order) {
    return { success: false, message: "Order not found" };
  }

  if (order.status !== "PENDING_OTP") {
    return { success: false, message: "Order already processed" };
  }

  if (!order.otpHash || !order.otpExpiresAt) {
    return { success: false, message: "OTP not available" };
  }

  const now = new Date();
  const hashed = hashOtp(otpCode);

  if (order.otpExpiresAt < now || hashed !== order.otpHash) {
    await prisma.order.update({
      where: { id: orderId },
      data: { otpAttempts: { increment: 1 } },
    });
    return { success: false, message: "Invalid or expired OTP" };
  }

  // Ensure stock is available before committing
  for (const item of order.items) {
    if (!item.variant) {
      return { success: false, message: "Variant missing for order item" };
    }
    if (item.variant.stock < item.quantity) {
      return { success: false, message: "Insufficient stock for one or more items" };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        deliveryStatus: "PENDING",
        otpHash: null,
        otpExpiresAt: null,
      },
    });

    for (const item of order.items) {
      if (!item.variantId) continue;
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId: item.variantId,
          movementType: "REMOVE",
          quantity: item.quantity,
          unitCost: item.variant?.wholesalePrice ?? null,
          note: "Order confirmed",
          orderId: order.id,
        },
      });
    }
  });

  return { success: true, message: "Order confirmed" };
}
