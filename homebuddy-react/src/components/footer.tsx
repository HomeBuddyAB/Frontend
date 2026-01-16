import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ backgroundColor: "#2B2B2B" }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#362222]/20 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Newsletter Section */}
        <div
          className="mb-12 sm:mb-16 pb-12 sm:pb-16 border-b"
          style={{ borderColor: "#423F3E" }}
        >
          <div className="max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
              Stay in the Loop
            </h3>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
              Get exclusive drops, early access, and rebel discounts straight to
              your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full sm:flex-1 px-4 py-3 rounded-lg text-white placeholder:text-gray-500 focus:outline-none transition-colors text-sm sm:text-base"
                style={{
                  backgroundColor: "#171010",
                  borderColor: "#423F3E",
                  border: "1px solid",
                }}
              />
              <button
                className="w-full sm:w-auto px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                style={{ backgroundColor: "#423F3E" }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          <div>
            <h5 className="text-white font-bold mb-3 sm:mb-4 text-xs sm:text-sm tracking-widest">
              SHOP
            </h5>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link
                  href="/new-arrivals"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    New Arrivals
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/best-sellers"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Best Sellers
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/sale"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Sale
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-3 sm:mb-4 text-xs sm:text-sm tracking-widest">
              INFO
            </h5>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    About Us
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Shipping
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Returns
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-3 sm:mb-4 text-xs sm:text-sm tracking-widest">
              SUPPORT
            </h5>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Contact
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    FAQ
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/size-guide"
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Size Guide
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-3 sm:mb-4 text-xs sm:text-sm tracking-widest">
              FOLLOW
            </h5>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                style={{
                  backgroundColor: "#171010",
                  border: "1px solid #423F3E",
                }}
              >
                <span className="text-base sm:text-lg">📷</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                style={{
                  backgroundColor: "#171010",
                  border: "1px solid #423F3E",
                }}
              >
                <span className="text-base sm:text-lg">🎵</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                style={{
                  backgroundColor: "#171010",
                  border: "1px solid #423F3E",
                }}
              >
                <span className="text-base sm:text-lg">📌</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-6 sm:pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-center md:text-left"
          style={{ borderColor: "#423F3E" }}
        >
          <div className="text-xs sm:text-sm text-gray-500">
            © 2025 Rebel Threads. All rights reserved.
          </div>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
