// AboutPage.tsx - Redesigned for HomeBuddy Home Decor
"use client";

import Link from "next/link";
import SplitText from "@/components/SplitText";
import AnimatedContent from "@/components/AnimatedContent";
import Waves from "@/components/Waves";

export default function AboutPage() {
  const stats = [
    { label: "HAPPY CUSTOMERS", value: "25K+" },
    { label: "PROJECTS COMPLETED", value: "50K+" },
    { label: "YEARS OF SERVICE", value: "15+" },
    { label: "PRODUCTS IN STOCK", value: "10K+" },
  ];

  const values = [
    {
      icon: "🏠",
      title: "QUALITY FIRST",
      desc: "We carefully curate every product in our collection. From premium tools to beautiful home decor, quality is never compromised.",
      accent: "#F4A261" // Primary orange
    },
    {
      icon: "💡",
      title: "EXPERT GUIDANCE",
      desc: "Our team has decades of combined experience. We're here to help you find the perfect solutions for your home projects.",
      accent: "#6A994E" // Green
    },
    {
      icon: "✨",
      title: "YOUR VISION",
      desc: "Every home is unique. We help you bring your vision to life with personalized advice and custom solutions.",
      accent: "#4A90E2" // Blue
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#FAF3E0" }}>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6 py-24 overflow-hidden">
        {/* Background Elements - Soft waves */}
        <div className="absolute inset-0 z-0 opacity-20">
          <Waves
            lineColor="#F4A261"
            backgroundColor="transparent"
            waveSpeedX={0.015}
            waveSpeedY={0.008}
            waveAmpX={30}
            waveAmpY={15}
            friction={0.92}
            tension={0.008}
            maxCursorMove={0}
            xGap={14}
            yGap={40}
          />
        </div>

        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "linear-gradient(135deg, #F4A261 0%, #E76F51 100%)" }} />
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: "linear-gradient(135deg, #6A994E 0%, #4A90E2 100%)" }} />

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="max-w-4xl">
            <AnimatedContent delay={0.1} distance={30}>
              <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: "#FFD166", color: "#2D3E50" }}>
                <span className="text-sm font-bold">🏠 Your Home Improvement Partner</span>
              </div>
            </AnimatedContent>

            <SplitText
              text="ABOUT\nHOMEBUDDY"
              breakOn="\n"
              className="text-6xl md:text-9xl font-black mb-8 leading-[0.85] tracking-tight text-[#2D3E50]"
              delay={50}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 50 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-50px"
              textAlign="left"
            />

            <AnimatedContent delay={0.4} distance={30}>
              <div className="h-1 w-24 mb-8" style={{ backgroundColor: "#F4A261" }}></div>
              <p className="text-xl md:text-2xl max-w-2xl leading-relaxed" style={{ color: "#5A6C7D" }}>
                Since 2010, we've been helping homeowners and DIY enthusiasts transform their spaces with quality products and expert guidance. Our passion for home improvement drives everything we do.
              </p>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Story Section - Alternating Layout */}
      <section className="px-6 py-24" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedContent distance={50} direction="horizontal">
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight" style={{ color: "#2D3E50" }}>
                Our Story
              </h2>
              <div className="space-y-6 text-lg leading-relaxed" style={{ color: "#5A6C7D" }}>
                <p>
                  HomeBuddy started with a simple mission: make home improvement accessible, enjoyable, and successful for everyone. What began as a small local shop has grown into a trusted destination for homeowners and contractors alike.
                </p>
                <p>
                  Our founders, experienced craftspeople and home renovation enthusiasts, recognized that many people felt overwhelmed by home projects. Big box stores offered little guidance, and specialty shops were intimidating. We set out to change that by combining quality products with friendly, expert advice.
                </p>
                <p className="border-l-4 pl-6 italic" style={{ borderColor: "#F4A261", color: "#2D3E50" }}>
                  "Your home should reflect who you are. We're here to help you make it happen."
                </p>
                <p>
                  Today, our team brings together decades of experience in construction, interior design, and retail. We're not just sellers—we're passionate about helping you create spaces you'll love.
                </p>
              </div>
            </AnimatedContent>

            {/* Visual Element */}
            <AnimatedContent distance={50} direction="horizontal" reverse={true}>
              <div className="relative h-[400px] w-full border-2 rounded-2xl p-2 rotate-1 hover:rotate-0 transition-transform duration-500" style={{ borderColor: "#E8DCC4" }}>
                <div className="absolute inset-0 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFF8F3" }}>
                  <span className="text-9xl">🏡</span>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full -z-10" style={{ backgroundColor: "#F4A261", opacity: 0.3 }}></div>
              </div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-24" style={{ backgroundColor: "#FAF3E0" }}>
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <h2 className="text-3xl md:text-5xl font-black mb-16 text-center tracking-tight" style={{ color: "#2D3E50" }}>
              What We Stand For
            </h2>
          </AnimatedContent>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <AnimatedContent key={idx} delay={idx * 0.1} distance={30}>
                <div className="bg-white rounded-xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col" style={{ borderColor: "#E8DCC4" }}>
                  {/* Top Accent Line */}
                  <div className="w-12 h-1.5 rounded-full mb-6 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: val.accent }}></div>

                  <div className="text-5xl mb-6">{val.icon}</div>
                  <h3 className="text-2xl font-black mb-4 tracking-wide" style={{ color: "#2D3E50" }}>
                    {val.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: "#5A6C7D" }}>
                    {val.desc}
                  </p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="px-6 py-24 relative" style={{ backgroundColor: "#FFFFFF" }}>
        {/* Decorative Background text */}
        <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-5">
          <h1 className="text-[12rem] font-black whitespace-nowrap leading-none" style={{ color: "#F4A261" }}>
            QUALITY
          </h1>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedContent distance={50} direction="horizontal">
              <div className="relative h-[400px] w-full border-2 rounded-2xl p-2 -rotate-1 hover:rotate-0 transition-transform duration-500 order-2 lg:order-1" style={{ borderColor: "#E8DCC4" }}>
                <div className="absolute inset-0 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFF8F3" }}>
                  <span className="text-9xl">🛠️</span>
                </div>
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full -z-10" style={{ backgroundColor: "#6A994E", opacity: 0.3 }}></div>
              </div>
            </AnimatedContent>

            <div className="order-1 lg:order-2">
              <AnimatedContent distance={50} direction="horizontal" reverse={true}>
                <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight" style={{ color: "#2D3E50" }}>
                  Our Commitment
                </h2>
                <div className="space-y-6 text-lg leading-relaxed" style={{ color: "#5A6C7D" }}>
                  <p>
                    Every product in our store is carefully selected for quality, durability, and value. Our team tests tools, inspects materials, and stands behind everything we sell. We've built relationships with trusted manufacturers and suppliers over the years.
                  </p>
                  <p>
                    We work directly with suppliers to bring you the best products at fair prices. No middlemen, no markup, just honest pricing. Our commitment to quality means we only stock items we'd use in our own homes.
                  </p>
                  <p>
                    Our team isn't just here to sell you products. We're craftspeople, DIYers, and home enthusiasts who genuinely care about helping you succeed. Many of us have completed our own renovation projects and understand the challenges you face.
                  </p>
                </div>
              </AnimatedContent>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="px-6 py-24" style={{ backgroundColor: "#FAF3E0" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight" style={{ color: "#2D3E50" }}>
              More Than A Store
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "#5A6C7D" }}>
              We're a community of homeowners, DIYers, and professionals who believe that every home deserves to be beautiful and functional. Join thousands of satisfied customers who trust us for their home improvement needs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <AnimatedContent key={idx} delay={idx * 0.1} distance={20}>
                <div
                  className="p-8 border-2 rounded-xl transition-all duration-300 bg-white hover:shadow-xl hover:-translate-y-1 flex flex-col items-center justify-center text-center h-full group"
                  style={{ borderColor: "#E8DCC4" }}
                >
                  <div className="text-4xl md:text-5xl font-black mb-2 transition-colors" style={{ color: "#F4A261" }}>
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm font-bold tracking-widest uppercase" style={{ color: "#5A6C7D" }}>
                    {stat.label}
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 text-center border-t-2" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8DCC4" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight" style={{ color: "#2D3E50" }}>
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-12" style={{ color: "#5A6C7D" }}>
            Browse our collections, visit our showroom, or reach out for personalized project advice. <br />
            Let's make your home amazing together. We're here to help every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/shop"
              className="inline-block px-10 py-4 font-bold text-sm tracking-widest uppercase transition-all transform hover:scale-105 hover:shadow-xl rounded-lg"
              style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
            >
              Shop Now
            </Link>
            <Link
              href="/contact"
              className="inline-block px-10 py-4 font-bold text-sm tracking-widest uppercase border-2 transition-all hover:scale-105 rounded-lg"
              style={{ borderColor: "#F4A261", color: "#2D3E50", backgroundColor: "transparent" }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}