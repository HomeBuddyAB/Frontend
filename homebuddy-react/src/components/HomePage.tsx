// HomePage.tsx - Redesigned for HomeBuddy
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import SplitText from "./SplitText";
import AnimatedContent from "./AnimatedContent";
import { itemService } from "@/lib/services/adminServices";
import { Hammer, Wrench, PaintBucket, Lightbulb } from "lucide-react";

export default function HomePage() {
  const [email, setEmail] = useState("");

  const demoItems = [
    { name: "Power Drill", price: "$89.99", image: "https://picsum.photos/600/400?random=1", link: "/shop" },
    { name: "Paint Roller Set", price: "$24.99", image: "https://picsum.photos/600/400?random=2", link: "/shop" },
    { name: "Tool Belt", price: "$34.99", image: "https://picsum.photos/600/400?random=3", link: "/shop" },
    { name: "LED Work Light", price: "$45.99", image: "https://picsum.photos/600/400?random=4", link: "/shop" },
  ];

  const categories = [
    {
      title: "Furniture",
      description: "Furnish and shape your living space",
      href: "/shop/furniture",
      icon: <Hammer className="w-8 h-8" />,
      accentColor: "#F4A261",
    },
    {
      title: "Materials",
      description: "Flooring, paint, and building supplies",
      href: "/shop/materials",
      icon: <Wrench className="w-8 h-8" />,
      accentColor: "#E76F51",
    },
    {
      title: "Power Tools",
      description: "Professional-grade tools for every project",
      href: "/shop/power-tools",
      icon: <PaintBucket className="w-8 h-8" />,
      accentColor: "#6A994E",
    },
    {
      title: "Lighting",
      description: "Lighting and electrical essentials",
      href: "/shop/lighting",
      icon: <Lightbulb className="w-8 h-8" />,
      accentColor: "#FFD166",
    }
  ];

  const [featuredProducts, setFeaturedProducts] = useState<Array<{ id: string; link: string, name: string; price: string; image: string }>>(demoItems.map((item, idx) => ({ id: `demo-${idx}`, ...item })));

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await itemService.getAll(1, 4);
        if (response && response.data && Array.isArray(response.data)) {
          if (response.data.length > 0) {
            const mappedProducts = response.data.map((item: any) => {
              const categorySlug = item.mainCategory ? item.mainCategory.toLowerCase() : 'shop';
              const fullLink = `/shop/${categorySlug}/${item.slug}?sku=${item.sku}`;
              return {
                id: item.sku || item.id || Math.random().toString(),
                name: item.groupName,
                price: `$${item.price.toFixed(2)}`,
                image: item.primaryImageUrl || "https://picsum.photos/600/400?random=1",
                link: fullLink
              };
            });
            setFeaturedProducts(mappedProducts);
          }
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#FAF3E0" }}>
      
      {/* Hero Section - Bright & Welcoming */}
      <section className="min-h-screen relative px-6 py-24 md:py-32 overflow-hidden flex flex-col justify-center">
        {/* Decorative circles in background */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-30 blur-3xl" style={{ background: "linear-gradient(135deg, #F4A261 0%, #E76F51 100%)" }} />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "linear-gradient(135deg, #6A994E 0%, #4A90E2 100%)" }} />

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="max-w-4xl">
            <AnimatedContent delay={0.1} distance={30}>
              <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: "#FFD166", color: "#2D3E50" }}>
                <span className="text-sm font-bold">🏠 Your Home Improvement Partner</span>
              </div>
            </AnimatedContent>

            <SplitText
              text="BUILD YOUR\nDREAM HOME"
              breakOn="\n"
              className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tight text-[#2D3E50]"
              delay={50}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-50px"
              textAlign="left"
            />

            <AnimatedContent delay={0.3} distance={30}>
              <div className="h-1 w-24 mb-8" style={{ backgroundColor: "#F4A261" }}></div>
              <p className="text-xl md:text-2xl mb-10 max-w-xl leading-relaxed" style={{ color: "#5A6C7D" }}>
                Quality tools and materials for every project. From small repairs to complete renovations, we've got you covered.
              </p>
            </AnimatedContent>

            <div className="flex flex-col sm:flex-row gap-4">
              <AnimatedContent delay={0.4} distance={25}>
                <Link
                  href="/shop"
                  className="inline-block px-10 py-4 font-bold text-sm tracking-widest uppercase transition-all transform hover:scale-105 hover:shadow-xl rounded-lg"
                  style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
                >
                  Shop Now
                </Link>
              </AnimatedContent>
              <AnimatedContent delay={0.5} distance={25}>
                <Link
                  href="/about"
                  className="inline-block px-10 py-4 font-bold text-sm tracking-widest uppercase border-2 transition-all hover:scale-105 rounded-lg"
                  style={{ borderColor: "#F4A261", color: "#2D3E50", backgroundColor: "transparent" }}
                >
                  Learn More
                </Link>
              </AnimatedContent>
            </div>
          </div>
        </div>

        {/* Hero Image - positioned at bottom, fully responsive */}
        <div className="absolute bottom-0 right-0 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 h-auto pointer-events-none opacity-80">
          <Image
            src="/HomeBuddy-HEADER.png"
            alt="Make Your Home You - Furnish & shape your living space"
            width={5564}
            height={1200}
            className="w-full h-auto object-contain object-bottom"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 75vw, (max-width: 1024px) 66vw, 50vw"
          />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <AnimatedContent delay={0.1} distance={30}>
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: "#2D3E50" }}>
                Featured Products
              </h2>
              <p className="text-lg" style={{ color: "#5A6C7D" }}>
                Handpicked essentials for your next project
              </p>
            </AnimatedContent>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((item, index) => (
              <AnimatedContent key={item.id} delay={index * 0.1} distance={30}>
                <Link href={item.link} className="group block">
                  <div className="bg-white rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2" style={{ borderColor: "#E8DCC4" }}>
                    <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: "#F5ECD4" }}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full font-bold text-sm" style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}>
                        NEW
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2 group-hover:text-[#F4A261] transition-colors" style={{ color: "#2D3E50" }}>
                        {item.name}
                      </h3>
                      <p className="text-2xl font-black" style={{ color: "#F4A261" }}>
                        {item.price}
                      </p>
                    </div>
                  </div>
                </Link>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FAF3E0" }}>
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: "#2D3E50" }}>
                Shop By Category
              </h2>
              <p className="text-lg" style={{ color: "#5A6C7D" }}>
                Find exactly what you need for your project
              </p>
            </div>
          </AnimatedContent>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, index) => (
              <AnimatedContent key={category.title} delay={index * 0.1} distance={30}>
                <Link href={category.href} className="block h-full">
                  <div 
                    className="group bg-white rounded-xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 min-h-[200px] flex flex-col"
                    style={{ borderColor: "#E8DCC4" }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div 
                        className="p-4 rounded-lg transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${category.accentColor}20`, color: category.accentColor }}
                      >
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black mb-2 group-hover:text-[#F4A261] transition-colors" style={{ color: "#2D3E50" }}>
                          {category.title}
                        </h3>
                        <p style={{ color: "#5A6C7D" }}>
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center gap-2 text-sm font-bold group-hover:gap-4 transition-all" style={{ color: "#F4A261" }}>
                      Shop Now 
                      <span className="transition-transform group-hover:translate-x-2">→</span>
                    </div>
                  </div>
                </Link>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: "#2D3E50" }}>
                Why Choose HomeBuddy?
              </h2>
              <p className="text-lg" style={{ color: "#5A6C7D" }}>
                Your trusted partner in home improvement
              </p>
            </div>
          </AnimatedContent>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedContent delay={0.1} distance={30}>
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ backgroundColor: "#FFF8F3" }}>
                  ⚡
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: "#2D3E50" }}>Fast Shipping</h3>
                <p className="leading-relaxed" style={{ color: "#5A6C7D" }}>
                  Most orders ship within 24 hours. Get your supplies when you need them, not when it's convenient for us.
                </p>
              </div>
            </AnimatedContent>

            <AnimatedContent delay={0.2} distance={30}>
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ backgroundColor: "#FFF8F3" }}>
                  🎯
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: "#2D3E50" }}>Expert Guidance</h3>
                <p className="leading-relaxed" style={{ color: "#5A6C7D" }}>
                  Our team has over 50 years of combined experience. We help you choose the right tools for your project.
                </p>
              </div>
            </AnimatedContent>

            <AnimatedContent delay={0.3} distance={30}>
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ backgroundColor: "#FFF8F3" }}>
                  💯
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: "#2D3E50" }}>Quality Guarantee</h3>
                <p className="leading-relaxed" style={{ color: "#5A6C7D" }}>
                  Every product is backed by our satisfaction guarantee. Love it or return it, no hassle.
                </p>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FAF3E0" }}>
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: "#2D3E50" }}>
                Customer Projects
              </h2>
              <p className="text-lg" style={{ color: "#5A6C7D" }}>
                See what our community has built
              </p>
            </div>
          </AnimatedContent>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((project, index) => (
              <AnimatedContent key={project} delay={index * 0.1} distance={30}>
                <div className="group bg-white rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2" style={{ borderColor: "#E8DCC4" }}>
                  <div className="relative aspect-4/3 overflow-hidden" style={{ backgroundColor: "#F5ECD4" }}>
                    <Image
                      src={`https://picsum.photos/800/600?random=${project + 10}`}
                      alt={`Project ${project}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2" style={{ color: "#2D3E50" }}>
                      {project === 1 ? "Kitchen Renovation" : project === 2 ? "Backyard Deck Build" : "Bathroom Remodel"}
                    </h3>
                    <p className="mb-4" style={{ color: "#5A6C7D" }}>
                      {project === 1 ? "Complete kitchen makeover with custom cabinets" : project === 2 ? "Cedar deck with built-in seating area" : "Modern bathroom with walk-in shower"}
                    </p>
                    <div className="text-sm font-bold" style={{ color: "#F4A261" }}>
                      View Project →
                    </div>
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>

          <AnimatedContent delay={0.4}>
            <div className="text-center mt-12">
              <Link
                href="/projects"
                className="inline-block px-10 py-4 font-bold text-sm tracking-widest uppercase border-2 transition-all hover:scale-105 rounded-lg"
                style={{ borderColor: "#F4A261", color: "#2D3E50", backgroundColor: "transparent" }}
              >
                View All Projects
              </Link>
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: "#2D3E50" }}>
                What Our Customers Say
              </h2>
              <p className="text-lg" style={{ color: "#5A6C7D" }}>
                Real feedback from real homeowners
              </p>
            </div>
          </AnimatedContent>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedContent delay={0.1} distance={30}>
              <div className="p-8 rounded-xl border-2 h-full" style={{ backgroundColor: "#FFF8F3", borderColor: "#E8DCC4" }}>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-2xl" style={{ color: "#FFD166" }}>★</span>
                  ))}
                </div>
                <p className="mb-6 leading-relaxed" style={{ color: "#5A6C7D" }}>
                  "Best home improvement store in the area! Staff is incredibly knowledgeable and helped me pick exactly what I needed for my deck project."
                </p>
                <div>
                  <p className="font-bold" style={{ color: "#2D3E50" }}>Sarah M.</p>
                  <p className="text-sm" style={{ color: "#8B9CAE" }}>San Francisco, CA</p>
                </div>
              </div>
            </AnimatedContent>

            <AnimatedContent delay={0.2} distance={30}>
              <div className="p-8 rounded-xl border-2 h-full" style={{ backgroundColor: "#FFF8F3", borderColor: "#E8DCC4" }}>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-2xl" style={{ color: "#FFD166" }}>★</span>
                  ))}
                </div>
                <p className="mb-6 leading-relaxed" style={{ color: "#5A6C7D" }}>
                  "Quality products at fair prices. I've been a contractor for 20 years and HomeBuddy is now my go-to supplier. Fast delivery too!"
                </p>
                <div>
                  <p className="font-bold" style={{ color: "#2D3E50" }}>Mike T.</p>
                  <p className="text-sm" style={{ color: "#8B9CAE" }}>Oakland, CA</p>
                </div>
              </div>
            </AnimatedContent>

            <AnimatedContent delay={0.3} distance={30}>
              <div className="p-8 rounded-xl border-2 h-full" style={{ backgroundColor: "#FFF8F3", borderColor: "#E8DCC4" }}>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-2xl" style={{ color: "#FFD166" }}>★</span>
                  ))}
                </div>
                <p className="mb-6 leading-relaxed" style={{ color: "#5A6C7D" }}>
                  "As a first-time DIYer, I was nervous about my bathroom remodel. The team walked me through everything. Project turned out amazing!"
                </p>
                <div>
                  <p className="font-bold" style={{ color: "#2D3E50" }}>Jessica L.</p>
                  <p className="text-sm" style={{ color: "#8B9CAE" }}>Berkeley, CA</p>
                </div>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Brand Partners / Trust Badges Section */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FAF3E0" }}>
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: "#2D3E50" }}>
                Trusted Brands We Carry
              </h2>
              <p className="text-lg" style={{ color: "#5A6C7D" }}>
                Only the best tools and materials for your projects
              </p>
            </div>
          </AnimatedContent>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {["DeWalt", "Makita", "Milwaukee", "Bosch", "Ryobi", "Black+Decker"].map((brand, index) => (
              <AnimatedContent key={brand} delay={index * 0.05} distance={20}>
                <div className="bg-white rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center justify-center h-24" style={{ borderColor: "#E8DCC4" }}>
                  <p className="font-bold text-lg text-center" style={{ color: "#5A6C7D" }}>{brand}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="px-6 py-20" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedContent>
            <div className="bg-linear-to-r from-[#F4A261] to-[#E76F51] rounded-2xl p-12 shadow-2xl">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                Get Expert Tips & Exclusive Deals
              </h3>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join our community and receive project inspiration, how-to guides, and special offers directly to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-lg text-[#2D3E50] placeholder-gray-400 border-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "transparent" }}
                />
                <button
                  className="px-8 py-4 font-bold text-sm tracking-widest uppercase transition-all hover:scale-105 rounded-lg"
                  style={{ backgroundColor: "#2D3E50", color: "#FFFFFF" }}
                >
                  Subscribe
                </button>
              </div>
              <p className="mt-4 text-xs text-white/70">
                No spam, just helpful content. Unsubscribe anytime.
              </p>
            </div>
          </AnimatedContent>
        </div>
      </section>
    </div>
  );
}