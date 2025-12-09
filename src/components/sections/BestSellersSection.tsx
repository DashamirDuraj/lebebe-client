"use client";

import { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";

type BestSellersSectionProps = {
  products: Product[];
  onProductClick: (product: Product) => void;
};

export function BestSellersSection({ products, onProductClick }: BestSellersSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3
            className="text-4xl text-neutral-900 mb-3"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
          >
            Our Best Sellers
          </h3>
          <p className="text-neutral-600 text-lg" style={{ fontFamily: "Inter, sans-serif" }}>
            Loved by parents everywhere
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
          ))}
        </div>
      </div>
    </section>
  );
}
