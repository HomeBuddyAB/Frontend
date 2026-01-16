"use client";

import Link from "next/link";
import SplitText from "@/components/SplitText";
import AnimatedContent from "@/components/AnimatedContent";
import GlareHover from "@/components/GlareHover";
import Waves from "@/components/Waves";

export default function ContactPage() {
  const contactMethods = [
    {
      icon: "📧",
      title: "EMAIL",
      desc: "For general inquiries, orders, and custom requests",
      action: "rebel@hellsedge.co",
      link: "mailto:rebel@hellsedge.co",
      accent: "#C0C0C0" // Silver
    },
    {
      icon: "📞",
      title: "PHONE",
      desc: "Mon-Fri: 10AM - 7PM PST. We actually pick up.",
      action: "+1 (555) 166-6420",
      link: "tel:+15551666420",
      accent: "#8B4513" // Leather
    },
    {
      icon: "💬",
      title: "SOCIALS",
      desc: "Slide into our DMs for quick responses.",
      action: "@hellsedge",
      link: "#",
      accent: "#362222" // Dark Red
    }
  ];

  const faqs = [
    {
      question: "Do you do custom sizing?",
      answer: "Hell yeah. Send us your measurements and we'll make it fit like a second skin.",
    },
    {
      question: "What's the return policy?",
      answer: "30 days, no questions asked. Custom pieces are final sale though.",
    },
    {
      question: "How long does shipping take?",
      answer: "Standard orders ship in 2-3 business days. Custom work takes 3-4 weeks depending on complexity.",
    },
    {
      question: "International shipping?",
      answer: "We ship worldwide. Rebels have no borders.",
    },
    {
      question: "Can I visit the store?",
      answer: "Absolutely. Come through, try stuff on, talk shop. No appointment needed.",
    },
    {
      question: "Wholesale inquiries?",
      answer: "Email us at wholesale@hellsedge.co for bulk orders and retailer partnerships.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#171010" }}>

      {/* Hero Section - CHANGED min-h-[60vh] TO min-h-screen */}
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
          <div className="max-w-3xl">
            <SplitText
              text="REACH\nOUT"
              breakOn="\n"
              className="text-6xl md:text-9xl font-bold text-white mb-8 leading-[0.85] tracking-tighter"
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 50 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-50px"
            />

            <AnimatedContent delay={0.4} distance={30}>
              <div className="h-1 w-24 bg-[#8B4513] mb-8"></div>
              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                We're not hiding. Hit us up through your preferred channel and
                we'll get back to you.
              </p>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Contact Methods - Glare Cards */}
      <section className="px-6 py-12 relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, idx) => (
              <AnimatedContent key={idx} delay={idx * 0.1} distance={30}>
                <Link href={method.link} className="block h-full">
                  <GlareHover
                    width="100%"
                    height="100%"
                    background="#2B2B2B"
                    borderRadius="0px"
                    borderColor="#423F3E"
                    glareColor="#ffffff"
                    glareOpacity={0.1}
                    glareAngle={60}
                    className="h-full group"
                  >
                    <div className="p-8 h-full flex flex-col min-h-[300px]">
                      {/* Accent Bar */}
                      <div className="w-12 h-1 mb-6 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: method.accent }}></div>

                      <div className="text-4xl mb-6">{method.icon}</div>
                      <h3 className="text-2xl font-bold text-white mb-2 tracking-wider">{method.title}</h3>
                      <p className="text-gray-400 mb-8 grow">{method.desc}</p>

                      <div className="text-white font-bold border-b border-transparent group-hover:border-white inline-block self-start transition-all">
                        {method.action}
                      </div>
                    </div>
                  </GlareHover>
                </Link>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Info Split */}
      <section className="px-6 py-24" style={{ backgroundColor: "#171010" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Location Card */}
            <AnimatedContent direction="horizontal" distance={50}>
              <div className="relative p-10 border-2 border-[#362222] bg-[#1a1515] h-full">
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#8B4513]"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#8B4513]"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#8B4513]"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#8B4513]"></div>

                <h3 className="text-3xl font-bold text-white mb-8 uppercase tracking-widest">
                  Visit The Den
                </h3>
                <div className="space-y-8">
                  <div>
                    <p className="text-xl text-white font-bold mb-1">666 Rebel Boulevard</p>
                    <p className="text-lg text-gray-400">Darkside District</p>
                    <p className="text-lg text-gray-400">Los Angeles, CA 90666</p>
                  </div>

                  <div className="h-px w-full bg-[#362222]"></div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#8B4513] text-sm font-bold mb-1 uppercase">Mon-Sat</p>
                      <p className="text-white text-lg">11AM - 8PM</p>
                    </div>
                    <div>
                      <p className="text-[#8B4513] text-sm font-bold mb-1 uppercase">Sunday</p>
                      <p className="text-white text-lg">12PM - 6PM</p>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm italic pt-4">
                    * Look for the building with the massive skull mural.
                  </p>
                </div>
              </div>
            </AnimatedContent>

            {/* Response Expectations */}
            <AnimatedContent direction="horizontal" distance={50} reverse={true}>
              <div className="p-10 border-l-4 border-[#2B2B2B] h-full flex flex-col justify-center space-y-10 pl-12">
                <div className="group">
                  <h4 className="text-white font-bold text-xl mb-3 flex items-center gap-3">
                    <span className="text-2xl">⚡</span> RESPONSE TIME
                  </h4>
                  <p className="text-gray-400 leading-relaxed group-hover:text-white transition-colors">
                    We reply within 24 hours on business days. Usually much faster.
                  </p>
                </div>

                <div className="group">
                  <h4 className="text-white font-bold text-xl mb-3 flex items-center gap-3">
                    <span className="text-2xl">🛠️</span> CUSTOM ORDERS
                  </h4>
                  <p className="text-gray-400 leading-relaxed group-hover:text-white transition-colors">
                    Hit us up for custom leather work, patches, or special requests. We love a challenge.
                  </p>
                </div>

                <div className="group">
                  <h4 className="text-white font-bold text-xl mb-3 flex items-center gap-3">
                    <span className="text-2xl">📦</span> ORDER ISSUES
                  </h4>
                  <p className="text-gray-400 leading-relaxed group-hover:text-white transition-colors">
                    Something wrong with your order? Email us immediately and we'll make it right.
                  </p>
                </div>
              </div>
            </AnimatedContent>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-24" style={{ backgroundColor: "#2B2B2B" }}>
        <div className="max-w-5xl mx-auto">
          <AnimatedContent>
            <h2 className="text-4xl font-bold text-white mb-16 text-center uppercase tracking-tight">
              Before You Ask
            </h2>
          </AnimatedContent>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <AnimatedContent key={idx} delay={idx * 0.05} distance={20}>
                <div
                  className="p-8 border border-[#423F3E] hover:border-[#8B4513] transition-all duration-300 bg-[#171010] h-full group hover:-translate-y-1"
                >
                  <h4 className="text-lg font-bold text-white mb-4 group-hover:text-[#8B4513] transition-colors">
                    {faq.question}
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}