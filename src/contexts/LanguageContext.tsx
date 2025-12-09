"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "sq";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    "header.freeShipping": "Free shipping over €49",
    "header.returns": "30-day easy returns",
    "header.contact": "Contact us",
    "header.help": "Help",
    "header.search": "Search for baby clothes, gifts...",
    "header.shop": "Shop",
    "header.babyGirl": "Baby Girl",
    "header.babyBoy": "Baby Boy",
    "header.newborn": "Newborn",
    "header.sale": "Sale",

    // Hero
    "hero.title": "Gentle Care for Your Little One",
    "hero.subtitle":
      "Discover our collection of soft, comfortable, and adorable baby clothes made with love",
    "hero.cta": "Shop Now",

    // Categories
    "categories.title": "Shop by Category",
    "categories.girl": "For Girls",
    "categories.boy": "For Boys",
    "categories.newborn": "Newborn",
    "categories.shopNow": "Shop Now",

    // Products
    "products.title": "Featured Products",
    "products.titleFiltered": "Products for",
    "products.clearFilter": "Clear filter",
    "products.new": "New",
    "products.sale": "Sale",
    "products.addToCart": "Add to Cart",

    // Trust Band
    "trust.freeShipping": "Free Shipping",
    "trust.freeShippingDesc": "On orders over €49",
    "trust.easyReturns": "Easy Returns",
    "trust.easyReturnsDesc": "Within 30 days",
    "trust.securePayment": "Secure Payment",
    "trust.securePaymentDesc": "100% protected",
    "trust.qualityGuaranteed": "Quality Guaranteed",
    "trust.qualityGuaranteedDesc": "Premium materials",

    // Newsletter
    "newsletter.title": "Join Our Little Family",
    "newsletter.subtitle": "Subscribe to get special offers and baby care tips",
    "newsletter.placeholder": "Enter your email",
    "newsletter.cta": "Subscribe",

    // Cart
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.size": "Size",
    "cart.quantity": "Quantity",
    "cart.remove": "Remove",
    "cart.subtotal": "Subtotal",
    "cart.shipping": "Shipping",
    "cart.shippingFree": "FREE",
    "cart.total": "Total",
    "cart.checkout": "Proceed to Checkout",
  },
  sq: {
    // Header
    "header.freeShipping": "Dërgim falas mbi €49",
    "header.returns": "Kthime të lehta brenda 30 ditësh",
    "header.contact": "Na kontaktoni",
    "header.help": "Ndihmë",
    "header.search": "Kërko për rroba foshnjash, dhurata...",
    "header.shop": "Dyqani",
    "header.babyGirl": "Vajza",
    "header.babyBoy": "Djem",
    "header.newborn": "Të Porsalindur",
    "header.sale": "Zbritje",

    // Hero
    "hero.title": "Kujdes i Butë për të Voglin Tuaj",
    "hero.subtitle":
      "Zbuloni koleksionin tonë të rrobave të buta, komode dhe të dashura për foshnja të bëra me dashuri",
    "hero.cta": "Blej Tani",

    // Categories
    "categories.title": "Blerje sipas Kategorisë",
    "categories.girl": "Për Vajza",
    "categories.boy": "Për Djem",
    "categories.newborn": "Të Porsalindur",
    "categories.shopNow": "Blej Tani",

    // Products
    "products.title": "Produktet në Pah",
    "products.titleFiltered": "Produkte për",
    "products.clearFilter": "Hiq filtrin",
    "products.new": "E re",
    "products.sale": "Zbritje",
    "products.addToCart": "Shto në Shportë",

    // Trust Band
    "trust.freeShipping": "Dërgim Falas",
    "trust.freeShippingDesc": "Për porosi mbi €49",
    "trust.easyReturns": "Kthime të Lehta",
    "trust.easyReturnsDesc": "Brenda 30 ditësh",
    "trust.securePayment": "Pagesë e Sigurt",
    "trust.securePaymentDesc": "100% e mbrojtur",
    "trust.qualityGuaranteed": "Cilësi e Garantuar",
    "trust.qualityGuaranteedDesc": "Materiale premium",

    // Newsletter
    "newsletter.title": "Bashkohu me Familjen Tonë të Vogël",
    "newsletter.subtitle":
      "Regjistrohu për të marrë ofertat speciale dhe këshilla për kujdesin e foshnjave",
    "newsletter.placeholder": "Vendos email-in tënd",
    "newsletter.cta": "Regjistrohu",

    // Cart
    "cart.title": "Shporta e Blerjeve",
    "cart.empty": "Shporta juaj është e zbrazët",
    "cart.size": "Madhësia",
    "cart.quantity": "Sasia",
    "cart.remove": "Hiq",
    "cart.subtotal": "Nëntotali",
    "cart.shipping": "Dërgimi",
    "cart.shippingFree": "FALAS",
    "cart.total": "Totali",
    "cart.checkout": "Vazhdo me Blerjen",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
