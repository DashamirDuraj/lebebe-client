"use client";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types/product";

type NewArrivalsSectionProps = {
  products: Product[];
  genderFilter: "all" | "girl" | "boy" | "newborn";
  filterLabel: string;
  onClearFilter: () => void;
  onProductClick: (product: Product) => void;
  onViewAll: () => void;
};

export function NewArrivalsSection({
  products,
  genderFilter,
  filterLabel,
  onClearFilter,
  onProductClick,
  onViewAll,
}: NewArrivalsSectionProps) {
  const hasFilter = genderFilter !== "all";
  const visibleProducts = products.slice(0, 4);

  return (
    <section id="products-section" className="py-16 bg-[#FBF6F9]">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            {hasFilter && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-600">Showing:</span>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${
                    genderFilter === "girl"
                      ? "bg-[#FBD3E9] text-[#F7B6C7]"
                      : genderFilter === "boy"
                        ? "bg-[#E6F4FB] text-[#7CC4E8]"
                        : "bg-[#B8E9D2]/30 text-[#5AAEA5]"
                  } font-semibold text-sm`}
                >
                  {filterLabel}
                  <button
                    onClick={onClearFilter}
                    className="ml-1 hover:opacity-70 transition-opacity"
                    aria-label="Clear filter"
                  >
                    ✕
                  </button>
                </span>
              </div>
            )}
            <h3
              className="text-4xl text-neutral-900 mb-2"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
            >
              {hasFilter ? `${filterLabel} - New Arrivals` : "New Arrivals"}
            </h3>
            <p className="text-neutral-600" style={{ fontFamily: "Inter, sans-serif" }}>
              {hasFilter ? `Fresh styles for your ${filterLabel.toLowerCase()}` : "Fresh styles for your little one"}
            </p>
          </div>
          <Button variant="outline" className="rounded-xl border-2 font-semibold hidden md:block" onClick={onViewAll}>
            View All
          </Button>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-neutral-500 mb-2">No products found in this category yet</p>
            <Button variant="outline" onClick={onViewAll} className="rounded-xl mt-4 border-2 font-semibold">
              View All Products
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
