"use client";

import { Truck, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

export function TrustBandSection() {
  return (
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
  );
}
