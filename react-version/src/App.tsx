import { useState } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartSidebar } from './components/CartSidebar';
import { products } from './data/products';
import { Product, CartItem } from './types/product';
import { Button } from './components/ui/button';
import { Truck, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function AppContent() {
  const { t } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [genderFilter, setGenderFilter] = useState<'all' | 'girl' | 'boy' | 'newborn'>('all');

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddToCart = (product: Product, size: string) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
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
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.size === size))
    );
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products based on gender selection
  const filteredProducts = genderFilter === 'all' 
    ? products 
    : products.filter(p => p.gender === genderFilter || p.gender === 'unisex');

  // Get filter label for display
  const getFilterLabel = () => {
    switch (genderFilter) {
      case 'girl': return t('header.babyGirl');
      case 'boy': return t('header.babyBoy');
      case 'newborn': return t('header.newborn');
      default: return '';
    }
  };

  // Handle filter change with smooth scroll
  const handleFilterChange = (filter: 'all' | 'girl' | 'boy' | 'newborn') => {
    setGenderFilter(filter);
    // Scroll to products section
    if (filter !== 'all') {
      setTimeout(() => {
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#E6F4FB]">
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 blob-pink rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 blob-blue rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 blob-mint rounded-full blur-3xl"></div>
        
        {/* Floating decorations */}
        <div className="absolute top-20 right-20 text-4xl animate-float opacity-20">🎈</div>
        <div className="absolute bottom-32 left-16 text-3xl animate-bounce-soft opacity-20">⭐</div>
        <div className="absolute top-40 left-1/4 text-2xl animate-wiggle opacity-20">💕</div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl mb-6 shadow-elevated">
              <Sparkles className="w-4 h-4 text-[#7CC4E8]" />
              <span className="text-sm font-semibold text-neutral-700">New Spring Collection 2025</span>
            </div>
            
            <h2 
              className="text-5xl md:text-7xl mb-6 text-neutral-900"
              style={{fontFamily: 'Poppins, sans-serif', fontWeight: 700, lineHeight: 1.1}}
            >
              Soft, Safe & 
              <br />
              <span className="text-[#7CC4E8]">Simply Beautiful</span>
            </h2>
            
            <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto" style={{fontFamily: 'Inter, sans-serif', fontWeight: 500}}>
              Premium organic baby clothing crafted with love in Albania. 
              Gentle fabrics, curated designs, fast delivery across EU.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="bg-[#7CC4E8] hover:bg-[#2F8CB7] text-white px-10 py-6 rounded-xl shadow-primary text-base font-semibold">
                Shop New Arrivals
              </Button>
              <Button variant="outline" className="px-10 py-6 rounded-xl border-2 border-[#F7B6C7] hover:bg-[#FBD3E9]/20 text-base font-semibold">
                Size Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Baby Girl */}
            <div 
              onClick={() => handleFilterChange('girl')}
              className="group relative overflow-hidden rounded-3xl shadow-elevated hover:shadow-xl transition-all cursor-pointer aspect-[3/2] bg-gradient-to-br from-[#FBD3E9] to-[#F7B6C7]"
            >
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-3xl text-white mb-2" style={{fontFamily: 'Poppins, sans-serif', fontWeight: 700}}>
                  Baby Girl
                </h3>
                <p className="text-white/90 mb-4 font-medium">Adorable dresses & rompers</p>
                <Button className="bg-white text-[#F7B6C7] hover:bg-gray-50 rounded-xl self-start font-semibold">
                  Shop Girl →
                </Button>
              </div>
              <div className="absolute top-4 right-4 text-6xl opacity-30 group-hover:scale-110 transition-transform">👗</div>
            </div>

            {/* Baby Boy */}
            <div 
              onClick={() => handleFilterChange('boy')}
              className="group relative overflow-hidden rounded-3xl shadow-elevated hover:shadow-xl transition-all cursor-pointer aspect-[3/2] bg-gradient-to-br from-[#A3D9F5] to-[#7CC4E8]"
            >
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-3xl text-white mb-2" style={{fontFamily: 'Poppins, sans-serif', fontWeight: 700}}>
                  Baby Boy
                </h3>
                <p className="text-white/90 mb-4 font-medium">Comfy & cool essentials</p>
                <Button className="bg-white text-[#7CC4E8] hover:bg-gray-50 rounded-xl self-start font-semibold">
                  Shop Boy →
                </Button>
              </div>
              <div className="absolute top-4 right-4 text-6xl opacity-30 group-hover:scale-110 transition-transform">👕</div>
            </div>

            {/* Newborn */}
            <div 
              onClick={() => handleFilterChange('newborn')}
              className="group relative overflow-hidden rounded-3xl shadow-elevated hover:shadow-xl transition-all cursor-pointer aspect-[3/2] bg-gradient-to-br from-[#B8E9D2] to-[#E6E0FA]"
            >
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-3xl text-white mb-2" style={{fontFamily: 'Poppins, sans-serif', fontWeight: 700}}>
                  Newborn
                </h3>
                <p className="text-white/90 mb-4 font-medium">Softest first clothes</p>
                <Button className="bg-white text-[#B8E9D2] hover:bg-gray-50 rounded-xl self-start font-semibold">
                  Shop Newborn →
                </Button>
              </div>
              <div className="absolute top-4 right-4 text-6xl opacity-30 group-hover:scale-110 transition-transform">🍼</div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section id="products-section" className="py-16 bg-[#FBF6F9]">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              {genderFilter !== 'all' && (
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-600">Showing:</span>
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${
                    genderFilter === 'girl' ? 'bg-[#FBD3E9] text-[#F7B6C7]' :
                    genderFilter === 'boy' ? 'bg-[#E6F4FB] text-[#7CC4E8]' :
                    'bg-[#B8E9D2]/30 text-[#5AAEA5]'
                  } font-semibold text-sm`}>
                    {getFilterLabel()}
                    <button 
                      onClick={() => setGenderFilter('all')}
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
                style={{fontFamily: 'Poppins, sans-serif', fontWeight: 700}}
              >
                {genderFilter !== 'all' ? `${getFilterLabel()} - New Arrivals` : 'New Arrivals'}
              </h3>
              <p className="text-neutral-600" style={{fontFamily: 'Inter, sans-serif'}}>
                {genderFilter !== 'all' 
                  ? `Fresh styles for your ${getFilterLabel().toLowerCase()}`
                  : 'Fresh styles for your little one'
                }
              </p>
            </div>
            <Button 
              variant="outline" 
              className="rounded-xl border-2 font-semibold hidden md:block"
              onClick={() => setGenderFilter('all')}
            >
              {genderFilter !== 'all' ? 'View All' : 'View All'}
            </Button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-neutral-500 mb-2">No products found in this category yet</p>
              <Button 
                variant="outline" 
                onClick={() => setGenderFilter('all')}
                className="rounded-xl mt-4 border-2 font-semibold"
              >
                View All Products
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 
              className="text-4xl text-neutral-900 mb-3"
              style={{fontFamily: 'Poppins, sans-serif', fontWeight: 700}}
            >
              Our Best Sellers
            </h3>
            <p className="text-neutral-600 text-lg" style={{fontFamily: 'Inter, sans-serif'}}>
              Loved by parents everywhere
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Band */}
      <section className="py-12 bg-gradient-to-r from-[#E6F4FB] via-white to-[#FBD3E9]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-elevated">
                <Truck className="w-8 h-8 text-[#7CC4E8]" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Free Delivery</p>
                <p className="text-sm text-neutral-600">Orders over €49</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-elevated">
                <RotateCcw className="w-8 h-8 text-[#F7B6C7]" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Easy Returns</p>
                <p className="text-sm text-neutral-600">30-day policy</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-elevated">
                <ShieldCheck className="w-8 h-8 text-[#16A34A]" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Secure Payment</p>
                <p className="text-sm text-neutral-600">SSL protected</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-elevated">
                <Sparkles className="w-8 h-8 text-[#B8E9D2]" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Quality Fabrics</p>
                <p className="text-sm text-neutral-600">100% organic</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        open={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#E6F4FB] via-white to-[#FBD3E9] border-t border-neutral-200">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7CC4E8] to-[#F7B6C7] rounded-2xl flex items-center justify-center shadow-elevated">
                    <span className="text-2xl">🍼</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#B8E9D2] rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="text-xl text-[#7CC4E8]" style={{fontFamily: 'Poppins, sans-serif', fontWeight: 700}}>
                    LeBebe
                  </h2>
                  <p className="text-xs text-neutral-500 -mt-0.5 font-medium">Albania</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 mb-4">
                Premium organic baby clothing crafted with love. Gentle fabrics for your little ones.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-neutral-600 hover:text-[#7CC4E8] transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-neutral-600 hover:text-[#7CC4E8] transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-neutral-600 hover:text-[#7CC4E8] transition-colors">
                    Size Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-neutral-600 hover:text-[#7CC4E8] transition-colors">
                    Shipping Info
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-neutral-600 hover:text-[#7CC4E8] transition-colors">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-neutral-600 hover:text-[#7CC4E8] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-neutral-600 hover:text-[#7CC4E8] transition-colors">
                    Return Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-neutral-600 hover:text-[#7CC4E8] transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>
                Follow Us
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                Stay connected for updates and inspiration
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-[#FBD3E9] transition-colors shadow-sm"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 text-[#F7B6C7]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-[#E6F4FB] transition-colors shadow-sm"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5 text-[#7CC4E8]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://tiktok.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-[#B8E9D2]/30 transition-colors shadow-sm"
                  aria-label="TikTok"
                >
                  <svg className="w-5 h-5 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-neutral-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-600">
              <p>© 2025 LeBebe Albania. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-[#7CC4E8] transition-colors">Terms</a>
                <a href="#" className="hover:text-[#7CC4E8] transition-colors">Privacy</a>
                <a href="#" className="hover:text-[#7CC4E8] transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}