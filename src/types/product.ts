export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  gender: "girl" | "boy" | "newborn" | "unisex";
  sizes: string[];
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}
