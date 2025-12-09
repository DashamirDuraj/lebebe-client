"use client";

import { Button } from "@/components/ui/button";

type Category = "all" | "girl" | "boy" | "newborn";

type CategoryGridProps = {
  onFilterChange: (filter: Category) => void;
};

export function CategoryGrid({ onFilterChange }: CategoryGridProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Baby Girl */}
          <div
            onClick={() => onFilterChange("girl")}
            className="group relative overflow-hidden rounded-3xl shadow-elevated hover:shadow-xl transition-all cursor-pointer aspect-[3/2] bg-gradient-to-br from-[#FBD3E9] to-[#F7B6C7]"
          >
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <h3
                className="text-3xl text-white mb-2"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
              >
                Baby Girl
              </h3>
              <p className="text-white/90 mb-4 font-medium">Adorable dresses & rompers</p>
              <Button className="bg-white text-[#F7B6C7] hover:bg-gray-50 rounded-xl self-start font-semibold">
                Shop Girl →
              </Button>
            </div>
            <div className="absolute top-4 right-4 text-6xl opacity-30 group-hover:scale-110 transition-transform">
              👗
            </div>
          </div>

          {/* Baby Boy */}
          <div
            onClick={() => onFilterChange("boy")}
            className="group relative overflow-hidden rounded-3xl shadow-elevated hover:shadow-xl transition-all cursor-pointer aspect-[3/2] bg-gradient-to-br from-[#A3D9F5] to-[#7CC4E8]"
          >
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <h3
                className="text-3xl text-white mb-2"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
              >
                Baby Boy
              </h3>
              <p className="text-white/90 mb-4 font-medium">Comfy & cool essentials</p>
              <Button className="bg-white text-[#7CC4E8] hover:bg-gray-50 rounded-xl self-start font-semibold">
                Shop Boy →
              </Button>
            </div>
            <div className="absolute top-4 right-4 text-6xl opacity-30 group-hover:scale-110 transition-transform">
              👕
            </div>
          </div>

          {/* Newborn */}
          <div
            onClick={() => onFilterChange("newborn")}
            className="group relative overflow-hidden rounded-3xl shadow-elevated hover:shadow-xl transition-all cursor-pointer aspect-[3/2] bg-gradient-to-br from-[#B8E9D2] to-[#E6E0FA]"
          >
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <h3
                className="text-3xl text-white mb-2"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
              >
                Newborn
              </h3>
              <p className="text-white/90 mb-4 font-medium">Softest first clothes</p>
              <Button className="bg-white text-[#B8E9D2] hover:bg-gray-50 rounded-xl self-start font-semibold">
                Shop Newborn →
              </Button>
            </div>
            <div className="absolute top-4 right-4 text-6xl opacity-30 group-hover:scale-110 transition-transform">
              🍼
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
