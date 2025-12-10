"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ProductModal } from "@/components/ProductModal";
import { CartSidebar } from "@/components/CartSidebar";
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
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  const mapApiProductToUi = (p: any): Product => {
    const sizes =
      p.variants?.map((v: any) => v.size).filter(Boolean) ??
      ["0-3M", "3-6M", "6-12M", "12-18M"];
    const gender = (p.gender || "unisex").toString().toLowerCase();

    return {
      id: p.id,
      name: p.name,
      price: Number(p.retailPrice ?? 0),
      image: p.mainImage?.url ?? p.media?.[0]?.url ?? "/placeholder.png",
      category: p.type ?? "General",
      gender: (gender === "girl" || gender === "boy" || gender === "newborn" || gender === "unisex"
        ? gender
        : "unisex") as Product["gender"],
      sizes,
      description: p.shortDescription ?? p.description ?? "",
      badges: p.badges ?? [],
      salePercent: p.salePercent ?? null,
    };
  };

  const fetchProducts = async (gender: "all" | "girl" | "boy" | "newborn") => {
    const genderParam =
      gender !== "all" ? `&gender=${gender.toUpperCase()}` : "";

    try {
      const res = await fetch(`/api/products?tag=new&tag=best-seller&pageSize=16${genderParam}`);
      const json = await res.json();
      const items: Product[] = (json.items || []).map(mapApiProductToUi);

      setNewArrivals(items.filter((item) => item.badges?.includes("new")).slice(0, 4));
      setBestSellers(items.filter((item) => item.badges?.includes("bestSeller")).slice(0, 4));
    } catch (error) {
      console.error("Failed to load products", error);
    }
  };

  // Load data on first paint
  useEffect(() => {
    fetchProducts(genderFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genderFilter]);

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

  const filteredNewArrivals =
    genderFilter === "all"
      ? newArrivals
      : newArrivals.filter((p) => p.gender === genderFilter || p.gender === "unisex");

  const filteredBestSellers =
    genderFilter === "all"
      ? bestSellers
      : bestSellers.filter((p) => p.gender === genderFilter || p.gender === "unisex");

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
        products={filteredNewArrivals}
        genderFilter={genderFilter}
        filterLabel={filterLabel}
        onClearFilter={() => setGenderFilter("all")}
        onProductClick={handleProductClick}
        onViewAll={() => setGenderFilter("all")}
      />

      <BestSellersSection products={filteredBestSellers} onProductClick={handleProductClick} />

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
