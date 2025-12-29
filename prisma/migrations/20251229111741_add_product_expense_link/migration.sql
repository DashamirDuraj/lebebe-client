-- AlterTable
ALTER TABLE "ShopExpense" ADD COLUMN     "productId" TEXT;

-- CreateIndex
CREATE INDEX "ShopExpense_productId_idx" ON "ShopExpense"("productId");

-- AddForeignKey
ALTER TABLE "ShopExpense" ADD CONSTRAINT "ShopExpense_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
