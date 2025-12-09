import { Product } from '../types/product';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export function ProductCard({ product, onProductClick }: ProductCardProps) {
  // Determine section color based on category
  const getSectionStyle = () => {
    const cat = product.category.toLowerCase();
    if (cat.includes('dress') || cat.includes('pink')) return 'from-[#FBD3E9]/20 to-[#FBD3E9]/5';
    if (cat.includes('boy') || cat.includes('blue')) return 'from-[#A3D9F5]/20 to-[#A3D9F5]/5';
    return 'from-[#B8E9D2]/20 to-[#B8E9D2]/5';
  };

  const badges = [];
  if (product.id === '1' || product.id === '2') badges.push({ text: 'New', color: 'bg-[#7CC4E8]' });
  if (product.id === '3') badges.push({ text: 'Best Seller', color: 'bg-[#F7B6C7]' });
  if (product.id === '6') badges.push({ text: '-20%', color: 'bg-[#DC2626]' });

  return (
    <motion.article 
      className="group cursor-pointer"
      onClick={() => onProductClick(product)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className={`relative aspect-square bg-gradient-to-br ${getSectionStyle()} rounded-2xl overflow-hidden mb-4 shadow-elevated group-hover:shadow-xl transition-shadow duration-300`}>
        <img
          src={product.image}
          alt={product.name}
          itemProp="image"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          width="400"
          height="400"
        />
        
        {/* Badge cluster */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {badges.map((badge, i) => (
            <Badge 
              key={i}
              className={`${badge.color} text-white shadow-lg rounded-lg px-2 py-1 text-xs font-semibold`}
            >
              {badge.text}
            </Badge>
          ))}
        </div>

        {/* Wishlist heart */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/95 hover:bg-white shadow-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
          }}
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4 text-[#F7B6C7]" />
        </Button>

        {/* Quick add */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="sm" 
            className="w-full bg-white text-neutral-900 hover:bg-neutral-50 shadow-lg rounded-xl font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product);
            }}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 
          className="line-clamp-2 text-neutral-900 group-hover:text-[#7CC4E8] transition-colors" 
          itemProp="name"
          style={{fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '0.95rem'}}
        >
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <p 
            className="text-[#2F8CB7]" 
            itemProp="offers" 
            itemScope 
            itemType="https://schema.org/Offer"
            style={{fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.1rem'}}
          >
            <meta itemProp="priceCurrency" content="EUR" />
            <span itemProp="price">€{product.price.toFixed(2)}</span>
          </p>
          
          {/* Color dots */}
          <ul className="flex gap-1" aria-label="Available colors">
            <li className="w-3 h-3 rounded-full bg-[#F7B6C7] border border-neutral-200" aria-label="Pink"></li>
            <li className="w-3 h-3 rounded-full bg-[#7CC4E8] border border-neutral-200" aria-label="Blue"></li>
            <li className="w-3 h-3 rounded-full bg-[#B8E9D2] border border-neutral-200" aria-label="Mint"></li>
          </ul>
        </div>
      </div>
    </motion.article>
  );
}