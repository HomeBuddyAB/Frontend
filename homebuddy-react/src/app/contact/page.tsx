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
      desc: "For general inquiries, orders, and project consultations",
      action: "hello@homebuddy.com",
      link: "mailto:hello@homebuddy.com",
      accent: "#F4A261" // Primary orange
    },
    {
      icon: "📞",
      title: "PHONE",
      desc: "Mon-Fri: 9AM - 6PM. We're here to help!",
      action: "+1 (555) HOME-123",
      link: "tel:+15554663123",
      accent: "#6A994E" // Green
    },
    {
      icon: "💬",
      title: "SOCIAL",
      desc: "Follow us for tips, inspiration, and special offers",
      action: "@homebuddy",
      link: "#",
      accent: "#4A90E2" // Blue
    }
  ];

  const faqs = [
    {
      question: "Do you offer delivery and assembly?",
      answer: "Yes! We offer delivery for larger items and assembly services. Contact us for a quote based on your location.",
    },
    {
      question: "What's your return policy?",
      answer: "30-day returns on most items. Custom orders and clearance items are final sale. See our full policy for details.",
    },
    {
      question: "How long does shipping take?",
      answer: "Standard orders ship within 3-5 business days. Custom projects vary from 2-4 weeks depending on the scope.",
    },
    {
      question: "Do you price match?",
      answer: "We're committed to fair pricing. Contact us if you find a lower price and we'll do our best to match it.",
    },
    {
      question: "Can I visit your showroom?",
      answer: "Absolutely! Come see our products in person, get expert advice, and enjoy complimentary coffee. No appointment needed.",
    },
    {
      question: "Professional contractor discounts?",
      answer: "Yes! Email us at trade@homebuddy.com for contractor pricing and bulk order information.",
    },
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
          <div className="max-w-3xl">
            <AnimatedContent delay={0.1} distance={30}>
              <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: "#FFD166", color: "#2D3E50" }}>
                <span className="text-sm font-bold">💬 We're Here to Help</span>
              </div>
            </AnimatedContent>

            <SplitText
              text="GET IN\nTOUCH"
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
              <p className="text-xl md:text-2xl max-w-xl leading-relaxed" style={{ color: "#5A6C7D" }}>
                Have questions about a project? Need advice on the right tools? 
                We're passionate about helping you make your home yours.
              </p>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Contact Methods - Friendly Cards */}
      <section className="px-6 py-12 relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, idx) => (
              <AnimatedContent key={idx} delay={idx * 0.1} distance={30}>
                <Link href={method.link} className="block h-full">
                  <div className="bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col min-h-[300px] group" style={{ borderColor: "#E8DCC4" }}>
                    {/* Accent Bar */}
                    <div className="w-12 h-1.5 rounded-full mb-6 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: method.accent }}></div>

                    <div className="text-5xl mb-6">{method.icon}</div>
                    <h3 className="text-2xl font-bold mb-3 tracking-wide" style={{ color: "#2D3E50" }}>{method.title}</h3>
                    <p className="mb-8 grow leading-relaxed" style={{ color: "#5A6C7D" }}>{method.desc}</p>

                    <div className="font-bold border-b-2 border-transparent group-hover:border-current inline-block self-start transition-all" style={{ color: method.accent }}>
                      {method.action}
                    </div>
                  </div>
                </Link>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Info Split */}
      <section className="px-6 py-24" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Location Card */}
            <AnimatedContent direction="horizontal" distance={50}>
              <div className="relative p-10 border-2 rounded-2xl h-full" style={{ backgroundColor: "#FFF8F3", borderColor: "#E8DCC4" }}>
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-2xl" style={{ borderColor: "#F4A261" }}></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-2xl" style={{ borderColor: "#F4A261" }}></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-2xl" style={{ borderColor: "#F4A261" }}></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-2xl" style={{ borderColor: "#F4A261" }}></div>

                <h3 className="text-3xl font-black mb-8 uppercase tracking-wide" style={{ color: "#2D3E50" }}>
                  Visit Our Showroom
                </h3>
                <div className="space-y-8">
                  <div>
                    <p className="text-xl font-bold mb-1" style={{ color: "#2D3E50" }}>123 Builder Street</p>
                    <p className="text-lg" style={{ color: "#5A6C7D" }}>Home District</p>
                    <p className="text-lg" style={{ color: "#5A6C7D" }}>San Francisco, CA 94102</p>
                  </div>

                  <div className="h-px w-full" style={{ backgroundColor: "#E8DCC4" }}></div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-bold mb-1 uppercase" style={{ color: "#F4A261" }}>Mon-Sat</p>
                      <p className="text-lg font-semibold" style={{ color: "#2D3E50" }}>9AM - 7PM</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold mb-1 uppercase" style={{ color: "#F4A261" }}>Sunday</p>
                      <p className="text-lg font-semibold" style={{ color: "#2D3E50" }}>10AM - 5PM</p>
                    </div>
                  </div>

                  <p className="text-sm italic pt-4" style={{ color: "#8B9CAE" }}>
                    🏠 Look for the friendly orange sign with our house logo!
                  </p>
                </div>
              </div>
            </AnimatedContent>

            {/* Response Expectations */}
            <AnimatedContent direction="horizontal" distance={50} reverse={true}>
              <div className="p-10 border-l-4 h-full flex flex-col justify-center space-y-10 pl-12" style={{ borderColor: "#F4A261" }}>
                <div className="group">
                  <h4 className="font-bold text-xl mb-3 flex items-center gap-3" style={{ color: "#2D3E50" }}>
                    <span className="text-2xl">⚡</span> QUICK RESPONSES
                  </h4>
                  <p className="leading-relaxed transition-colors" style={{ color: "#5A6C7D" }}>
                    We typically respond within 4 business hours. Your project is important to us!
                  </p>
                </div>

                <div className="group">
                  <h4 className="font-bold text-xl mb-3 flex items-center gap-3" style={{ color: "#2D3E50" }}>
                    <span className="text-2xl">🛠️</span> PROJECT CONSULTATIONS
                  </h4>
                  <p className="leading-relaxed transition-colors" style={{ color: "#5A6C7D" }}>
                    Need help planning your project? Schedule a free consultation with our expert team.
                  </p>
                </div>

                <div className="group">
                  <h4 className="font-bold text-xl mb-3 flex items-center gap-3" style={{ color: "#2D3E50" }}>
                    <span className="text-2xl">📦</span> ORDER SUPPORT
                  </h4>
                  <p className="leading-relaxed transition-colors" style={{ color: "#5A6C7D" }}>
                    Questions about your order? Contact us anytime and we'll help track it down.
                  </p>
                </div>

                <div className="group">
                  <h4 className="font-bold text-xl mb-3 flex items-center gap-3" style={{ color: "#2D3E50" }}>
                    <span className="text-2xl">💡</span> EXPERT ADVICE
                  </h4>
                  <p className="leading-relaxed transition-colors" style={{ color: "#5A6C7D" }}>
                    Not sure which product is right? Our team has decades of experience to guide you.
                  </p>
                </div>
              </div>
            </AnimatedContent>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-24" style={{ backgroundColor: "#FAF3E0" }}>
        <div className="max-w-5xl mx-auto">
          <AnimatedContent>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-center tracking-tight" style={{ color: "#2D3E50" }}>
              Frequently Asked Questions
            </h2>
            <p className="text-center text-lg mb-16" style={{ color: "#5A6C7D" }}>
              Quick answers to common questions
            </p>
          </AnimatedContent>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <AnimatedContent key={idx} delay={idx * 0.05} distance={20}>
                <div
                  className="p-8 border-2 rounded-xl transition-all duration-300 bg-white h-full group hover:-translate-y-1 hover:shadow-xl"
                  style={{ borderColor: "#E8DCC4" }}
                >
                  <h4 className="text-lg font-bold mb-4 transition-colors" style={{ color: "#2D3E50" }}>
                    {faq.question}
                  </h4>
                  <p className="leading-relaxed" style={{ color: "#5A6C7D" }}>
                    {faq.answer}
                  </p>
                </div>
              </AnimatedContent>
            ))}
          </div>

          {/* CTA at bottom */}
          <AnimatedContent delay={0.6}>
            <div className="mt-16 text-center">
              <p className="text-xl mb-6" style={{ color: "#5A6C7D" }}>
                Still have questions? We're here to help!
              </p>
              <Link
                href="mailto:hello@homebuddy.com"
                className="inline-block px-10 py-4 font-bold text-sm tracking-widest uppercase transition-all transform hover:scale-105 hover:shadow-xl rounded-lg"
                style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
              >
                Contact Us
              </Link>
            </div>
          </AnimatedContent>
        </div>
      </section>
    </div>
  );
}