"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { ProductModal } from "@/components/ProductModal";
import { CartSidebar } from "@/components/CartSidebar";
import { products } from "@/data/products";
import { Product, CartItem } from "@/types/product";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { NewArrivalsSection } from "@/components/sections/NewArrivalsSection";
import { BestSellersSection } from "@/components/sections/BestSellersSection";
import { TrustBandSection } from "@/components/sections/TrustBandSection";
import { FooterSection } from "@/components/sections/FooterSection";

export default function HomePage() {
  const { t } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [genderFilter, setGenderFilter] = useState<"all" | "girl" | "boy" | "newborn">("all");

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddToCart = (product: Product, size: string) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) => item.product.id === product.id && item.size === size,
      );

      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...prev, { product, size, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, size: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId, size);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item,
      ),
    );
  };

  const handleRemoveItem = (productId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.size === size)),
    );
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts =
    genderFilter === "all"
      ? products
      : products.filter((p) => p.gender === genderFilter || p.gender === "unisex");

  const getFilterLabel = () => {
    switch (genderFilter) {
      case "girl":
        return t("header.babyGirl");
      case "boy":
        return t("header.babyBoy");
      case "newborn":
        return t("header.newborn");
      default:
        return "";
    }
  };

  const filterLabel = getFilterLabel();

  const handleFilterChange = (filter: "all" | "girl" | "boy" | "newborn") => {
    setGenderFilter(filter);
    if (filter !== "all") {
      setTimeout(() => {
        const productsSection = document.getElementById("products-section");
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById("products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header
        cartItemCount={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
        activeFilter={genderFilter}
        onFilterChange={handleFilterChange}
      />

      <HeroSection onPrimaryClick={scrollToProducts} />

      <CategoryGrid onFilterChange={handleFilterChange} />

      <NewArrivalsSection
        products={filteredProducts}
        genderFilter={genderFilter}
        filterLabel={filterLabel}
        onClearFilter={() => setGenderFilter("all")}
        onProductClick={handleProductClick}
        onViewAll={() => setGenderFilter("all")}
      />

      <BestSellersSection products={filteredProducts} onProductClick={handleProductClick} />

      <TrustBandSection />

      <ProductModal
        product={selectedProduct}
        open={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <CartSidebar
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <FooterSection />
    </div>
  );
}
