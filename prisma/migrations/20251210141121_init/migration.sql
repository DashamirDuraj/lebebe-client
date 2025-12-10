-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('GIRL', 'BOY', 'NEWBORN', 'UNISEX');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'UNISEX',
ADD COLUMN     "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "salePercent" INTEGER,
ADD COLUMN     "shortDescription" TEXT;
