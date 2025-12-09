"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeroSectionProps = {
  onPrimaryClick?: () => void;
};

export function HeroSection({ onPrimaryClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#E6F4FB]">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 blob-pink rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 blob-blue rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 blob-mint rounded-full blur-3xl" />

      {/* Floating decorations */}
      <div className="absolute top-20 right-20 text-4xl animate-float opacity-20">🎈</div>
      <div className="absolute bottom-32 left-16 text-3xl animate-bounce-soft opacity-20">⭐</div>
      <div className="absolute top-40 left-1/4 text-2xl animate-wiggle opacity-20">💕</div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl mb-6 shadow-elevated">
            <Sparkles className="w-4 h-4 text-[#7CC4E8]" />
            <span className="text-sm font-semibold text-neutral-700">
              New Spring Collection 2025
            </span>
          </div>

          <h2
            className="text-5xl md:text-7xl mb-6 text-neutral-900"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, lineHeight: 1.1 }}
          >
            Soft, Safe & <br />
            <span className="text-[#7CC4E8]">Simply Beautiful</span>
          </h2>

          <p
            className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}
          >
            Premium organic baby clothing crafted with love in Albania. Gentle fabrics, curated
            designs, fast delivery across EU.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              className="bg-[#7CC4E8] hover:bg-[#2F8CB7] text-white px-10 py-6 rounded-xl shadow-primary text-base font-semibold"
              onClick={onPrimaryClick}
            >
              Shop New Arrivals
            </Button>
            <Button
              variant="outline"
              className="px-10 py-6 rounded-xl border-2 border-[#F7B6C7] hover:bg-[#FBD3E9]/20 text-base font-semibold"
            >
              Size Guide
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
