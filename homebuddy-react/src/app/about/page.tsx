// AboutPage.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import SplitText from "@/components/SplitText";
import AnimatedContent from "@/components/AnimatedContent";
import GlareHover from "@/components/GlareHover";
import Waves from "@/components/Waves";

export default function AboutPage() {
  const stats = [
    { label: "PIECES CRAFTED", value: "50K+" },
    { label: "COUNTRIES", value: "40+" },
    { label: "CUSTOM ORDERS", value: "15K+" },
    { label: "YEARS STRONG", value: "10+" },
  ];

  const values = [
    {
      icon: "⚡",
      title: "QUALITY OVER EVERYTHING",
      desc: "Premium materials, expert craftsmanship, built to last. Your gear should outlive trends.",
      accent: "#8B4513" // Leather accents
    },
    {
      icon: "🔥",
      title: "AUTHENTICITY",
      desc: "No posers, no pretenders. We live this lifestyle. Every piece is designed by people who actually wear this stuff.",
      accent: "#C0C0C0" // Silver accents
    },
    {
      icon: "🤘",
      title: "INDIVIDUALITY",
      desc: "Express yourself. Custom work is our specialty. Your vision, our execution.",
      accent: "#1C1C1C" // Blackout accents
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#171010" }}>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6 py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 opacity-30">
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

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="max-w-4xl">
            <SplitText
              text="WE DON'T\nFOLLOW TRENDS"
              breakOn="\n"
              className="text-5xl md:text-8xl font-bold text-white mb-8 leading-[0.9]"
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 50 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-50px"
            />

            <AnimatedContent delay={0.5} distance={30}>
              <div className="h-1 w-24 bg-[#8B4513] mb-8"></div>
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
                We set them. Since 2015, we've been crafting premium leather and
                metal for those who refuse to blend in.
              </p>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Story Section - Alternating Layout */}
      <section className="px-6 py-24" style={{ backgroundColor: "#2B2B2B" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedContent distance={50} direction="horizontal">
              <h2 className="text-4xl font-bold text-white mb-8 tracking-wide">
                THE ORIGIN STORY
              </h2>
              <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                <p>
                  Started in a garage with a sewing machine, a dream, and way
                  too much black leather. What began as custom patches for local
                  bands turned into something bigger.
                </p>
                <p className="border-l-4 border-[#8B4513] pl-6 italic text-white">
                  "Real rebels needed real gear. So we built it ourselves."
                </p>
                <p>
                  We saw a gap in the market. Mass-produced garbage trying to
                  look edgy, or overpriced designer pieces that missed the point
                  entirely.
                </p>
              </div>
            </AnimatedContent>

            {/* Visual Element */}
            <AnimatedContent distance={50} direction="horizontal" reverse={true}>
              <div className="relative h-[400px] w-full border-2 border-[#423F3E] p-2 rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-[#171010] flex items-center justify-center">
                  {/* Replace with <Image /> when you have one */}
                  <span className="text-9xl filter grayscale contrast-150">🏍️</span>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#362222] -z-10"></div>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Values Section - Using GlareHover */}
      <section className="px-6 py-24" style={{ backgroundColor: "#171010" }}>
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center uppercase tracking-tighter">
              What We Stand For
            </h2>
          </AnimatedContent>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <div key={idx} className="h-full">
                <GlareHover
                  width="100%"
                  height="100%"
                  background="#2B2B2B"
                  borderRadius="0px"
                  borderColor="#423F3E"
                  glareColor="#ffffff"
                  glareOpacity={0.15}
                  glareAngle={45}
                  className="h-full group"
                >
                  <div className="p-8 h-full flex flex-col relative">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: val.accent }}></div>

                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 origin-left">{val.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">
                      {val.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </GlareHover>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="px-6 py-24 relative" style={{ backgroundColor: "#2B2B2B" }}>
        {/* Decorative Background text */}
        <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-5">
          <h1 className="text-[12rem] font-black text-white whitespace-nowrap leading-none">
            HANDMADE
          </h1>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedContent distance={50} direction="horizontal">
              <div className="relative h-[400px] w-full border-2 border-[#423F3E] p-2 -rotate-1 hover:rotate-0 transition-transform duration-500 order-2 lg:order-1">
                <div className="absolute inset-0 bg-[#171010] flex items-center justify-center">
                  {/* Replace with <Image /> when you have one */}
                  <span className="text-9xl">✂️</span>
                </div>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#8B4513] -z-10"></div>
              </div>
            </AnimatedContent>

            <div className="order-1 lg:order-2">
              <AnimatedContent distance={50} direction="horizontal" reverse={true}>
                <h2 className="text-4xl font-bold text-white mb-8 tracking-wide">
                  THE CRAFT
                </h2>
                <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                  <p>
                    Every jacket is hand-cut from full-grain leather. Every stud
                    is hand-set. Every zipper is tested to withstand years of
                    abuse.
                  </p>
                  <p>
                    We source our materials from the same suppliers that high-end
                    fashion houses use, but we skip the markup and the bullshit.
                  </p>
                  <p>
                    Our workshop isn't a factory. It's a collective of
                    craftspeople who give a damn about what they make. You'll feel
                    the difference the moment you put it on.
                  </p>
                </div>
              </AnimatedContent>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="px-6 py-24" style={{ backgroundColor: "#171010" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 uppercase">
              More Than A Brand
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We're a community of riders, musicians, artists, and rebels who
              refuse to compromise. When you rock our gear, you're part of
              something bigger.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <AnimatedContent key={idx} delay={idx * 0.1} distance={20}>
                <div
                  className="p-8 border border-[#362222] bg-[#1f1616] hover:bg-[#2B2B2B] transition-colors duration-300 flex flex-col items-center justify-center text-center h-full group"
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-[#8B4513] transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm font-bold tracking-widest text-gray-500 uppercase">
                    {stat.label}
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 text-center border-t border-[#362222]" style={{ backgroundColor: "#171010" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            READY TO JOIN?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Browse our collections or hit us up for custom work. <br />
            Let's create something legendary.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/shop"
              className="px-10 py-4 text-white font-bold text-sm tracking-widest transition-all transform hover:scale-105 hover:bg-[#4a2f2f] cursor-pointer bg-[#362222]"
            >
              SHOP NOW
            </Link>
            <Link
              href="/contact"
              className="px-10 py-4 text-white font-bold text-sm tracking-widest border border-[#423F3E] hover:bg-[#2B2B2B] transition-colors cursor-pointer"
            >
              CUSTOM ORDERS
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}