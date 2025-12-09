"use client";

export function FooterSection() {
  return (
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
                <h2
                  className="text-xl text-[#7CC4E8]"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
                >
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
            <h3
              className="font-semibold text-neutral-900 mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
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
            <h3
              className="font-semibold text-neutral-900 mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
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
            <h3
              className="font-semibold text-neutral-900 mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Follow Us
            </h3>
            <p className="text-sm text-neutral-600 mb-4">Stay connected for updates and inspiration</p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-[#FBD3E9] transition-colors shadow-sm"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-[#F7B6C7]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
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
              <a href="#" className="hover:text-[#7CC4E8] transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-[#7CC4E8] transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-[#7CC4E8] transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
