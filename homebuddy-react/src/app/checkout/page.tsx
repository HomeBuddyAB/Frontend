"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // State for "Fake" processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  useEffect(() => {
    setMounted(true);
    // Pre-fill email if user is logged in
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow only numbers and slash, restrict length to 5 (MM/YY)
    const formattedValue = value.replace(/[^0-9/]/g, "").slice(0, 5);
    setFormData({ ...formData, expiry: formattedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    try {
      // Prepare order items in the format expected by the API
      const orderItems = items.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
      }));

      // Call the checkout API
      const response = await userService.checkoutCart(
        formData.email,
        orderItems
      );

      if (response.error) {
        setError(response.error);
        setIsProcessing(false);
        return;
      }

      if (response.data) {
        // Store order number
        setOrderNumber(response.data.orderNo);

        // Clear the cart
        await userService.clearCart();
        clearCart();

        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to process order");
    } finally {
      setIsProcessing(false);
    }
  };

  // Hydration guard
  if (!mounted) return null;

  // 1. Empty Cart State
  if (items.length === 0 && !isSuccess) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: "#171010" }}
      >
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">
          CART IS EMPTY
        </h1>
        <p className="text-gray-400 mb-8 font-mono">
          Add some materials before proceeding.
        </p>
        <Link
          href="/shop"
          className="px-8 py-4 border border-[#362222] text-white font-bold hover:bg-white hover:text-black transition-all tracking-widest uppercase"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  // 2. Success State
  if (isSuccess) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: "#171010" }}
      >
        <div className="max-w-lg w-full border border-[#362222] p-12 text-center bg-[#1a1a1a]">
          <div className="w-20 h-20 bg-[#8B4513] rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter uppercase">
            Order Confirmed
          </h1>
          <p className="text-gray-500 font-mono text-sm mb-8 uppercase tracking-widest">
            Order #{orderNumber || "PROCESSING"}
          </p>

          <p className="text-gray-300 mb-8 leading-relaxed">
            Your requisition has been processed. Construction materials will be
            dispatched to{" "}
            <span className="text-white font-bold">{formData.address}</span>{" "}
            shortly.
          </p>

          <Link
            href="/shop"
            className="block w-full py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-[#8B4513] hover:text-white transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // 3. Main Checkout Form
  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: "#171010" }}>
      {/* Header */}
      <div className="pt-32 pb-12 px-6 md:px-12 border-b border-[#362222]">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 text-gray-500 text-xs font-mono uppercase mb-4 tracking-widest">
            <Link href="/shop" className="hover:text-white transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-[#8B4513]">Checkout</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase">
            Secure Checkout
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500 text-red-200 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* LEFT COLUMN: FORMS */}
          <div className="lg:col-span-7 space-y-16">
            <form id="checkout-form" onSubmit={handleSubmit}>
              {/* Section: Contact */}
              <section className="mb-16">
                <h2 className="text-xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-4">
                  <span className="flex items-center justify-center w-8 h-8 border border-[#362222] text-[#8B4513] text-sm">
                    01
                  </span>
                  Contact Info
                </h2>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#201a1a] border border-[#362222] text-white px-6 py-4 focus:outline-none focus:border-[#8B4513] focus:bg-[#251f1f] transition-colors placeholder-gray-700 font-mono text-sm"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
              </section>

              {/* Section: Shipping */}
              <section className="mb-16">
                <h2 className="text-xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-4">
                  <span className="flex items-center justify-center w-8 h-8 border border-[#362222] text-[#8B4513] text-sm">
                    02
                  </span>
                  Shipping Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      First Name
                    </label>
                    <input
                      required
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-[#201a1a] border border-[#362222] text-white px-6 py-4 focus:outline-none focus:border-[#8B4513] focus:bg-[#251f1f] transition-colors font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Last Name
                    </label>
                    <input
                      required
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-[#201a1a] border border-[#362222] text-white px-6 py-4 focus:outline-none focus:border-[#8B4513] focus:bg-[#251f1f] transition-colors font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Address
                    </label>
                    <input
                      required
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-[#201a1a] border border-[#362222] text-white px-6 py-4 focus:outline-none focus:border-[#8B4513] focus:bg-[#251f1f] transition-colors font-mono text-sm"
                      placeholder="123 Industrial Ave"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      City
                    </label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-[#201a1a] border border-[#362222] text-white px-6 py-4 focus:outline-none focus:border-[#8B4513] focus:bg-[#251f1f] transition-colors font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      ZIP / Postal Code
                    </label>
                    <input
                      required
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full bg-[#201a1a] border border-[#362222] text-white px-6 py-4 focus:outline-none focus:border-[#8B4513] focus:bg-[#251f1f] transition-colors font-mono text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Section: Payment */}
              <section>
                <h2 className="text-xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-4">
                  <span className="flex items-center justify-center w-8 h-8 border border-[#362222] text-[#8B4513] text-sm">
                    03
                  </span>
                  Payment Method
                </h2>

                {/* Fake Card Visual */}
                <div className="bg-[#201a1a] border border-[#362222] p-6 mb-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg
                      className="w-32 h-32 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                        Credit Card
                      </span>
                      <span className="font-bold text-white tracking-widest">
                        VISA
                      </span>
                    </div>
                    <div className="mb-6">
                      <input
                        required
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => {
                          let v = e.target.value
                            .replace(/\s+/g, "")
                            .replace(/[^0-9]/gi, "");
                          let matches = v.match(/\d{4,16}/g);
                          let match = (matches && matches[0]) || "";
                          let parts = [];
                          for (let i = 0, len = match.length; i < len; i += 4) {
                            parts.push(match.substring(i, i + 4));
                          }
                          if (parts.length) v = parts.join(" ");
                          setFormData({ ...formData, cardNumber: v });
                        }}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="w-full bg-transparent text-xl md:text-2xl font-mono text-white placeholder-gray-700 focus:outline-none tracking-widest"
                      />
                    </div>
                    <div className="flex gap-8">
                      <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                          Expiry
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="MM/YY"
                          name="expiry"
                          maxLength={5}
                          value={formData.expiry}
                          onChange={handleExpiryChange}
                          className="w-full bg-transparent text-white font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                          CVC
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="123"
                          name="cvc"
                          maxLength={3}
                          value={formData.cvc}
                          onChange={handleInputChange}
                          className="w-16 bg-transparent text-white font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </form>
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="border border-[#362222] bg-[#1a1a1a] p-8">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 border-b border-[#362222] pb-4">
                  Order Manifest
                </h3>

                {/* Items List */}
                <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#362222] scrollbar-track-transparent">
                  {items.map((item) => (
                    <div key={item.sku} className="flex gap-4 group">
                      <div className="w-16 h-20 relative bg-[#201a1a] border border-[#362222] shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                            IMG
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-white font-bold text-sm uppercase tracking-wide leading-tight">
                            {item.name}
                          </h4>
                          <span className="text-gray-400 font-mono text-xs ml-2">
                            x{item.quantity}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono uppercase mt-1">
                          {item.sku}
                        </div>
                        <div className="text-xs text-gray-500 font-mono uppercase mt-1">
                          {item.size} / {item.color}
                        </div>
                      </div>
                      <div className="text-white font-mono text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-[#362222] pt-6 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 uppercase tracking-wider">
                      Subtotal
                    </span>
                    <span className="text-gray-300 font-mono">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 uppercase tracking-wider">
                      Shipping
                    </span>
                    <span className="text-gray-300 font-mono">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 uppercase tracking-wider">
                      Taxes
                    </span>
                    <span className="text-gray-300 font-mono">$0.00</span>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-white pt-6 mb-8">
                  <span className="text-white font-bold uppercase tracking-widest">
                    Total Due
                  </span>
                  <span className="text-3xl font-black text-white tracking-tighter font-mono">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessing}
                  className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-sm hover:bg-[#8B4513] hover:text-white disabled:bg-[#362222] disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-3">
                      <span
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                  ) : (
                    `Pay $${totalPrice.toFixed(2)}`
                  )}
                </button>

                <p className="text-[10px] text-gray-600 text-center mt-4 uppercase tracking-widest">
                  Secure Encrypted Transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
