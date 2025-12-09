"use client";

import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

export function ProductModal({ product, open, onClose, onAddToCart }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState("");

  if (!product) return null;

  const handleAddToCart = () => {
    if (selectedSize) {
      onAddToCart(product, selectedSize);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle
            style={{ fontWeight: 800, fontSize: "1.75rem" }}
            className="text-purple-600"
          >
            {product.name}
          </DialogTitle>
          <DialogDescription style={{ fontWeight: 600 }}>
            {product.category} - Available in multiple sizes 🎀
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl overflow-hidden shadow-xl relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 text-3xl animate-wiggle">✨</div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <Badge variant="secondary" className="rounded-full px-3 py-1" style={{ fontWeight: 700 }}>
                {product.category}
              </Badge>
              <p className="text-3xl text-pink-500 mt-2" style={{ fontWeight: 800 }}>
                €{product.price.toFixed(2)}
              </p>
            </div>

            <p className="text-gray-600" style={{ fontWeight: 600 }}>
              {product.description}
            </p>

            <div>
              <label className="block mb-2" style={{ fontWeight: 700 }}>
                Select Size 👶
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full ${
                      selectedSize === size ? "bg-purple-500 hover:bg-purple-600" : "border-2 border-purple-300"
                    }`}
                    style={{ fontWeight: 700 }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-auto">
              <Button
                className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 rounded-full shadow-lg"
                onClick={handleAddToCart}
                disabled={!selectedSize}
                style={{ fontWeight: 700 }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart 🎉
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-2 border-pink-300">
                <Heart className="h-4 w-4 text-pink-500" />
              </Button>
            </div>

            <div className="text-sm text-gray-600 space-y-2 bg-yellow-50 p-4 rounded-2xl" style={{ fontWeight: 600 }}>
              <p>✅ Free shipping on orders over €50</p>
              <p>✅ 30-day return policy</p>
              <p>✅ Made from organic materials</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
