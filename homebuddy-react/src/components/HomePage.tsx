// HomePage.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import SplitText from "./SplitText";
import AnimatedContent from "./AnimatedContent";
import Waves from "./Waves";
import FlowingMenu from "./FlowingMenu";
import CurvedLoop from "./CurvedLoop";
import { itemService } from "@/lib/services/adminServices";
import GlareHover from "./GlareHover";

export default function HomePage() {
    const [email, setEmail] = useState("");

    // Default items in case API fails or returns empty
    const demoItems = [
        { name: "Leather Biker Jacket", price: "$199", image: "https://picsum.photos/600/400?random=1", link: "/shop" },
        { name: "Studded Belt", price: "$49", image: "https://picsum.photos/600/400?random=2", link: "/shop" },
        { name: "Band T-Shirt", price: "$29", image: "https://picsum.photos/600/400?random=3", link: "/shop" },
        { name: "Spiked Wristband", price: "$19", image: "https://picsum.photos/600/400?random=4", link: "/shop" },
    ];

    const categories = [
        {
            title: "TOPS",
            description: "Leather jackets, denim vests, and rugged outerwear.",
            href: "/shop/tops",
            accentColor: "#8B4513",
        },
        {
            title: "BOTTOMS",
            description: "Distressed jeans and leather pants.",
            href: "/shop/bottoms",
            accentColor: "#C0C0C0",
        },
        {
            title: "ACCESSORIES",
            description: "Studded belts, jewelry, and rugged bags.",
            href: "/shop/accessories",
            accentColor: "#6B7280",
        },
        {
            title: "FOOTWEAR",
            description: "Boots built for the road.",
            href: "/shop/footwear",
            accentColor: "#362222",
        }
    ];

    const [featuredProducts, setFeaturedProducts] = useState<Array<{ link: string, name: string; price: string; image: string }>>(demoItems);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const response = await itemService.getAll(1, 4);
                if (response && response.data && Array.isArray(response.data)) {
                    // Only map if we actually got results, otherwise keep demo items
                    if (response.data.length > 0) {
                        const mappedProducts = response.data.map((item: any) => {
                            const categorySlug = item.mainCategory ? item.mainCategory.toLowerCase() : 'shop';
                            const fullLink = `/shop/${categorySlug}/${item.slug}?sku=${item.sku}`;
                            return {
                                name: item.groupName,
                                price: `$${item.price.toFixed(2)}`,
                                image: item.primaryImageUrl || "https://picsum.photos/600/400?random=1", // Fallback image
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
      <div
        className="min-h-screen overflow-x-hidden"
        style={{ backgroundColor: "#171010" }}
      >
        {/* Hero Section */}
        <section className="h-screen relative px-6 py-24 md:py-32 overflow-hidden flex flex-col justify-center">
          {/* LAYER 0: Background Waves */}
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
            <Waves
              lineColor="#362222"
              backgroundColor="transparent"
              waveSpeedX={0.02}
              waveSpeedY={0.01}
              waveAmpX={40}
              waveAmpY={20}
              friction={0.9}
              tension={0.01}
              maxCursorMove={0}
              xGap={12}
              yGap={36}
            />
          </div>

          {/* LAYER 1: Hero Image (The Bike) */}
          {/* Fix: Removed translate-y, increased width, set z-index to 1 */}
          <div className="hidden md:block absolute bottom-0 right-0 w-full pointer-events-none z-1">
            <Image
              src="/HomeBuddy_HEADER.png"
              alt="Grey mountain landscape with bike in foreground"
              width={5564}
              height={1745}
              className="w-full h-auto object-contain object-bottom"
              priority
            />
          </div>

          {/* LAYER 2: Gradient Fade (blends image into next section) */}
          <div className="absolute bottom-0 left-0 w-full h-48 bg-linear-to-t from-[#171010] to-transparent z-2"></div>

          {/* LAYER 3: Text Content */}
          <div className="max-w-7xl mx-auto relative z-10 w-full h-full flex flex-col justify-center pointer-events-none">
            <div className="max-w-4xl pointer-events-auto">
              <SplitText
                text="DEFY THE\nORDINARY"
                breakOn="\n"
                className="text-6xl md:text-9xl font-bold text-white mb-6 leading-[0.85] tracking-tighter"
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="left"
              />

              <div className="h-1 w-32 bg-[#8B4513] mb-8"></div>

              <SplitText
                className="text-xl md:text-2xl text-gray-300 mb-10 max-w-xl font-light tracking-wide"
                text="Premium leather, metal, and attitude. For those who live on the edge and dress like they mean it."
                textAlign="left"
                splitType="words"
                delay={125}
                duration={0.6}
                ease="power3.out"
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
              />

              <div className="flex flex-col sm:flex-row gap-6">
                <AnimatedContent delay={0.5} distance={25}>
                  <Link
                    href="/shop"
                    className="inline-block px-10 py-4 text-white font-bold text-sm tracking-widest uppercase transition-all transform hover:scale-105 hover:bg-[#4a2f2f] border-2 border-[#362222]"
                    style={{ backgroundColor: "#362222" }}
                  >
                    Shop Now
                  </Link>
                </AnimatedContent>
                <AnimatedContent delay={0.6} distance={25}>
                  <Link
                    href="/about"
                    className="inline-block px-10 py-4 text-white font-bold text-sm tracking-widest uppercase border-2 transition-colors hover:bg-white hover:text-black hover:border-white"
                    style={{ borderColor: "#423F3E" }}
                  >
                    The Story
                  </Link>
                </AnimatedContent>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products - Flowing Menu (Desktop) & Grid (Mobile) */}
        <section
          className="relative min-h-screen lg:min-h-[80vh] flex flex-col justify-center pt-20 md:pt-10"
          style={{ backgroundColor: "#171010" }}
        >
          {/* Diagonal divider */}
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#362222] to-transparent opacity-50"></div>

          {/* Marquee Text */}
          <div className="absolute top-10 w-full z-10 pointer-events-none">
            <CurvedLoop
              marqueeText="NEW ARRIVALS ✦ BEST SELLERS ✦ LIMITED EDITION ✦ HELL'S EDGE ✦ "
              className="text-white text-xl font-black opacity-60 tracking-widest"
              speed={0.5}
              curveAmount={30}
            />
          </div>

          {/* --- MOBILE/TABLET VIEW: Standard Grid (Visible on screens smaller than lg) --- */}
          <div className="lg:hidden relative z-20 px-6 mt-35 mb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-md sm:max-w-3xl mx-auto">
              {featuredProducts.map((item, index) => (
                <Link key={index} href={item.link} className="group block">
                  <div className="relative aspect-4/5 w-full overflow-hidden border border-[#362222] bg-[#201a1a]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110 group-hover:opacity-80"
                    />
                    {/* Mobile Price Badge */}
                    <div className="absolute bottom-0 right-0 bg-[#8B4513] text-white px-3 py-1 font-bold text-sm">
                      {item.price}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-white text-xl font-bold uppercase tracking-wider group-hover:text-[#8B4513] transition-colors">
                      {item.name}
                    </h3>
                    <div className="h-0.5 w-12 bg-[#362222] mt-2 group-hover:w-full transition-all duration-500"></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* --- DESKTOP VIEW: Flowing Menu (Visible only on lg screens and up) --- */}
          <div className="hidden lg:block w-full h-[600px] relative z-20 mt-auto">
            <FlowingMenu
              items={featuredProducts.map((item) => ({
                ...item,
                text: item.name,
                image: item.image,
                price: item.price,
              }))}
            />
          </div>
        </section>

        {/* Categories - Glare Grid */}
        <section
          className="py-32 px-6 relative"
          style={{ backgroundColor: "#2B2B2B" }}
        >
          <div className="max-w-7xl mx-auto">
            <AnimatedContent>
              <div className="flex flex-col items-center mb-16">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter">
                  THE COLLECTION
                </h2>
                <div className="w-24 h-1.5 bg-[#8B4513]"></div>
              </div>
            </AnimatedContent>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((category, index) => (
                <AnimatedContent
                  key={category.title}
                  delay={index * 0.1}
                  distance={30}
                >
                  <Link href={category.href} className="block h-full">
                    <GlareHover
                      width="100%"
                      height="100%"
                      background="#171010"
                      borderRadius="0px"
                      borderColor="#423F3E"
                      glareColor="#ffffff"
                      glareOpacity={0.15}
                      glareAngle={45}
                      className="transition-all duration-500 group h-full min-h-[220px]"
                    >
                      {/* Accent bar on hover */}
                      <div
                        className="absolute top-0 left-0 w-1 h-full transition-all duration-500 group-hover:w-2"
                        style={{ backgroundColor: category.accentColor }}
                      />

                      <div className="relative h-full flex flex-col justify-center px-10 py-8 pl-12">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-3xl font-bold text-white mb-3 tracking-widest group-hover:text-[#8B4513] transition-colors">
                              {category.title}
                            </h3>
                            <p className="text-gray-400 text-lg max-w-sm">
                              {category.description}
                            </p>
                          </div>
                          <div className="text-4xl text-[#333] group-hover:text-white transition-all duration-300 transform group-hover:translate-x-2">
                            →
                          </div>
                        </div>
                      </div>
                    </GlareHover>
                  </Link>
                </AnimatedContent>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter - Statement Section */}
        <section
          className="px-6 py-32 relative overflow-hidden"
          style={{ backgroundColor: "#171010" }}
        >
          {/* Decorative Background */}
          <div
            className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#362222 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>

          <div className="max-w-4xl mx-auto relative z-10 border border-[#362222] bg-[#1a1515] p-12 md:p-20 text-center">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#8B4513]"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#8B4513]"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#8B4513]"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#8B4513]"></div>

            <AnimatedContent>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                JOIN THE REBELLION
              </h3>
              <p className="text-gray-400 mb-10 text-xl max-w-xl mx-auto">
                Get exclusive drops, early access to limited runs, and{" "}
                <span className="text-white font-bold">15% off</span> your first
                order.
              </p>

              <div className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-6 py-4 bg-[#0f0a0a] text-white placeholder-gray-600 border-2 border-[#362222] focus:border-[#8B4513] outline-none transition-colors font-mono uppercase text-sm"
                />
                <button
                  className="px-8 py-4 text-white font-bold text-sm tracking-widest uppercase transition-all cursor-pointer border-2 border-l-0 sm:border-l-0 border-[#362222] hover:bg-[#8B4513] hover:border-[#8B4513]"
                  style={{ backgroundColor: "#2B2B2B" }}
                >
                  Subscribe
                </button>
              </div>
              <p className="mt-6 text-xs text-[#362222] font-mono uppercase">
                No spam. Only heavy metal.
              </p>
            </AnimatedContent>
          </div>
        </section>
      </div>
    );
}