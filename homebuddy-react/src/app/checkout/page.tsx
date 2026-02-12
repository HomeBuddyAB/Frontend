"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";
import { taxService, type CountryTaxBracket } from "@/lib/services/tax.service";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, setShowLoginPopup } = useAuth();
  const router = useRouter();

  // State for "Fake" processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");

  // Tax / Country
  const [countries, setCountries] = useState<CountryTaxBracket[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [countriesLoading, setCountriesLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: "",
    countryCode: "",
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

  // Fetch European countries with VAT rates
  useEffect(() => {
    taxService.getCountries().then((res) => {
      setCountriesLoading(false);
      if (res.data) {
        setCountries(res.data);
        if (res.data.length > 0 && !selectedCountry) {
          setSelectedCountry(res.data[0].code);
          setFormData((prev) => ({ ...prev, countryCode: res.data![0].code }));
        }
      }
    });
  }, []);

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
    const country = selectedCountry || formData.countryCode;
    if (!country) {
      setError("Please select your country for VAT calculation.");
      return;
    }
    setIsProcessing(true);
    setError("");

    try {
      // Prepare order items in the format expected by the API
      const orderItems = items.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
      }));

      // Call the checkout API with countryCode for tax
      const response = await userService.checkoutCart(
        formData.email,
        orderItems,
        country
      );

      if (response.error) {
        setError(response.error);
        setIsProcessing(false);
        return;
      }

      if (response.data) {
        // Store order number
        setOrderNumber(response.data.orderNo ?? "");

        // Clear the cart (server cart only when logged in; local cart always)
        if (user) await userService.clearCart();
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

  // Tax calculation based on selected country
  const selectedCountryData = countries.find((c) => c.code === selectedCountry);
  const subtotal = totalPrice;
  const taxResult = selectedCountryData
    ? taxService.calculateTaxLocal(subtotal, selectedCountryData.vatRate)
    : { subtotal, taxRate: 0, taxAmount: 0, total: subtotal };

  // Hydration guard
  if (!mounted) return null;

  // 1. Empty Cart State
  if (items.length === 0 && !isSuccess) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: "#FAF3E0" }}
      >
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-4xl font-black mb-4 tracking-tight" style={{ color: "#2D3E50" }}>
            Your Cart is Empty
          </h1>
          <p className="text-lg mb-8" style={{ color: "#5A6C7D" }}>
            Add some items to your cart before checking out
          </p>
          <Link
            href="/shop"
            className="inline-block px-10 py-4 font-bold text-sm tracking-widest uppercase transition-all hover:shadow-xl rounded-lg"
            style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // 2. Success State
  if (isSuccess) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: "#FAF3E0" }}
      >
        <div className="max-w-lg w-full rounded-2xl p-12 text-center border-2 shadow-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8DCC4" }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg" style={{ backgroundColor: "#6A994E" }}>
            <svg
              className="w-12 h-12 text-white"
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

          <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight uppercase" style={{ color: "#2D3E50" }}>
            Order Confirmed! 🎉
          </h1>
          <div className="inline-block px-4 py-2 rounded-full mb-8" style={{ backgroundColor: "#FFF8F3", color: "#F4A261" }}>
            <span className="text-sm font-bold uppercase tracking-wider">
              Order #{orderNumber || "PROCESSING"}
            </span>
          </div>

          <p className="text-lg mb-4 leading-relaxed" style={{ color: "#2D3E50" }}>
            Thank you for your order! Your items will be delivered to:
          </p>
          <p className="text-lg font-bold mb-8" style={{ color: "#F4A261" }}>
            📍 {formData.address}, {formData.city}
          </p>

          <p className="text-sm mb-8" style={{ color: "#5A6C7D" }}>
            We've sent a confirmation email to <strong>{formData.email}</strong>
          </p>

          {!user && orderNumber && (
            <div className="mb-8 p-4 rounded-xl border-2 text-left" style={{ backgroundColor: "#FFF8F3", borderColor: "#F4A261" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "#2D3E50" }}>
                Create an account to save this order to your order history
              </p>
              <p className="text-xs mb-3" style={{ color: "#5A6C7D" }}>
                Register with <strong>{formData.email}</strong> and this order will be linked to your account.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') window.sessionStorage.setItem('pendingClaimOrderNo', orderNumber);
                  setShowLoginPopup(true, 'signup');
                }}
                className="w-full py-3 rounded-lg font-bold text-sm tracking-wider transition-all hover:shadow-lg"
                style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
              >
                Register and link this order
              </button>
            </div>
          )}

          <Link
            href="/shop"
            className="block w-full py-4 rounded-lg font-black uppercase tracking-widest transition-all hover:shadow-xl"
            style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // 3. Main Checkout Form
  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: "#FAF3E0" }}>
      {/* Header */}
      <div className="pt-28 pb-8 px-6 md:px-12 border-b-2" style={{ borderColor: "#E8DCC4" }}>
        <div className="container mx-auto">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase mb-4 tracking-wide" style={{ color: "#5A6C7D" }}>
            <Link href="/shop" className="transition-colors" style={{ color: "#5A6C7D" }}>
              Shop
            </Link>
            <span>/</span>
            <span style={{ color: "#F4A261" }}>Checkout</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight uppercase" style={{ color: "#2D3E50" }}>
            🔒 Secure Checkout
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-12">
        {/* Guest: Register to attach order to your account */}
        {!user && (
          <div className="mb-8 p-6 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ backgroundColor: "#FFF8F3", borderColor: "#F4A261" }}>
            <div>
              <h3 className="font-bold text-lg mb-1" style={{ color: "#2D3E50" }}>
                Create an account and attach this order
              </h3>
              <p className="text-sm" style={{ color: "#5A6C7D" }}>
                Register now and this purchase will be saved to your account for order history and support.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLoginPopup(true, "signup")}
              className="shrink-0 px-6 py-3 rounded-lg font-bold text-sm tracking-wider transition-all hover:shadow-lg whitespace-nowrap"
              style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}
            >
              Register
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 rounded-xl border-2" style={{ backgroundColor: "#FFE5E5", borderColor: "#FF6B6B", color: "#C92A2A" }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <strong className="font-bold">Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT COLUMN: FORMS */}
          <div className="lg:col-span-7 space-y-8">
            <form id="checkout-form" onSubmit={handleSubmit}>
              {/* Section: Contact */}
              <section className="mb-8 bg-white rounded-2xl p-8 border-2 shadow-sm" style={{ borderColor: "#E8DCC4" }}>
                <h2 className="text-xl font-black uppercase tracking-wide mb-6 flex items-center gap-3" style={{ color: "#2D3E50" }}>
                  <span className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}>
                    1
                  </span>
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#5A6C7D" }}>
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border-2 rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none transition-all"
                      style={{ 
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E8DCC4",
                        color: "#2D3E50"
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#F4A261"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#E8DCC4"}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </section>

              {/* Section: Shipping */}
              <section className="mb-8 bg-white rounded-2xl p-8 border-2 shadow-sm" style={{ borderColor: "#E8DCC4" }}>
                <h2 className="text-xl font-black uppercase tracking-wide mb-6 flex items-center gap-3" style={{ color: "#2D3E50" }}>
                  <span className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}>
                    2
                  </span>
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#5A6C7D" }}>
                      First Name
                    </label>
                    <input
                      required
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full border-2 rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none transition-all"
                      style={{ 
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E8DCC4",
                        color: "#2D3E50"
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#F4A261"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#E8DCC4"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#5A6C7D" }}>
                      Last Name
                    </label>
                    <input
                      required
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full border-2 rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none transition-all"
                      style={{ 
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E8DCC4",
                        color: "#2D3E50"
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#F4A261"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#E8DCC4"}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#5A6C7D" }}>
                      Street Address
                    </label>
                    <input
                      required
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full border-2 rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none transition-all"
                      style={{ 
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E8DCC4",
                        color: "#2D3E50"
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#F4A261"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#E8DCC4"}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#5A6C7D" }}>
                      City
                    </label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border-2 rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none transition-all"
                      style={{ 
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E8DCC4",
                        color: "#2D3E50"
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#F4A261"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#E8DCC4"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#5A6C7D" }}>
                      ZIP Code
                    </label>
                    <input
                      required
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full border-2 rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none transition-all"
                      style={{ 
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E8DCC4",
                        color: "#2D3E50"
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#F4A261"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#E8DCC4"}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#5A6C7D" }}>
                      Country (for VAT / Tax)
                    </label>
                    <select
                      required
                      value={selectedCountry}
                      onChange={(e) => {
                        const code = e.target.value;
                        setSelectedCountry(code);
                        setFormData((prev) => ({ ...prev, countryCode: code }));
                      }}
                      className="w-full border-2 rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none transition-all"
                      style={{ 
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E8DCC4",
                        color: "#2D3E50"
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#F4A261")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#E8DCC4")}
                      disabled={countriesLoading}
                    >
                      <option value="">Select your country</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.vatRate}% VAT)
                        </option>
                      ))}
                    </select>
                    {countriesLoading && (
                      <p className="text-xs" style={{ color: "#5A6C7D" }}>Loading countries…</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Section: Payment */}
              <section className="bg-white rounded-2xl p-8 border-2 shadow-sm" style={{ borderColor: "#E8DCC4" }}>
                <h2 className="text-xl font-black uppercase tracking-wide mb-6 flex items-center gap-3" style={{ color: "#2D3E50" }}>
                  <span className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" style={{ backgroundColor: "#F4A261", color: "#FFFFFF" }}>
                    3
                  </span>
                  Payment Details
                </h2>

                {/* Card Visual */}
                <div className="rounded-xl p-8 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #F4A261 0%, #E76F51 100%)" }}>
                  <div className="absolute top-0 right-0 p-4 opacity-20">
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
                      <span className="text-xs text-white/80 uppercase tracking-widest font-bold">
                        Credit / Debit Card
                      </span>
                      <span className="font-black text-white tracking-widest text-lg">
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
                        className="w-full bg-transparent text-xl md:text-2xl font-mono text-white placeholder-white/40 focus:outline-none tracking-widest"
                      />
                    </div>
                    <div className="flex gap-8">
                      <div className="flex-1">
                        <label className="block text-[10px] text-white/80 uppercase tracking-widest mb-2 font-bold">
                          Expiry Date
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="MM/YY"
                          name="expiry"
                          maxLength={5}
                          value={formData.expiry}
                          onChange={handleExpiryChange}
                          className="w-full bg-transparent text-white font-mono focus:outline-none text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/80 uppercase tracking-widest mb-2 font-bold">
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
                          className="w-20 bg-transparent text-white font-mono focus:outline-none text-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm" style={{ color: "#5A6C7D" }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Your payment information is secure and encrypted</span>
                </div>
              </section>
            </form>
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="rounded-2xl p-8 border-2 shadow-lg" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8DCC4" }}>
                <h3 className="text-xl font-black uppercase tracking-wide mb-6 pb-4 border-b-2" style={{ color: "#2D3E50", borderColor: "#E8DCC4" }}>
                  Order Summary
                </h3>

                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.sku} className="flex gap-4 p-4 rounded-lg" style={{ backgroundColor: "#FFF8F3" }}>
                      <div className="w-16 h-20 relative rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: "#F5ECD4" }}>
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1 line-clamp-2" style={{ color: "#2D3E50" }}>
                          {item.name}
                        </h4>
                        <div className="text-xs mb-1" style={{ color: "#8B9CAE" }}>
                          {item.size} / {item.color}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold" style={{ color: "#5A6C7D" }}>
                            Qty: {item.quantity}
                          </span>
                          <span className="text-sm font-bold" style={{ color: "#F4A261" }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-6 mb-6 border-t-2" style={{ borderColor: "#E8DCC4" }}>
                  <div className="flex justify-between text-sm">
                    <span className="uppercase tracking-wide font-semibold" style={{ color: "#5A6C7D" }}>
                      Subtotal
                    </span>
                    <span className="font-bold" style={{ color: "#2D3E50" }}>
                      ${taxResult.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="uppercase tracking-wide font-semibold" style={{ color: "#5A6C7D" }}>
                      Shipping
                    </span>
                    <span className="font-bold" style={{ color: "#6A994E" }}>FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="uppercase tracking-wide font-semibold" style={{ color: "#5A6C7D" }}>
                      Tax {selectedCountryData ? `(${selectedCountryData.name}, ${taxResult.taxRate}%)` : ""}
                    </span>
                    <span className="font-bold" style={{ color: "#2D3E50" }}>
                      ${taxResult.taxAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 mb-8 border-t-2" style={{ borderColor: "#F4A261" }}>
                  <span className="font-black uppercase tracking-wide text-lg" style={{ color: "#2D3E50" }}>
                    Total
                  </span>
                  <span className="text-3xl font-black" style={{ color: "#F4A261" }}>
                    ${taxResult.total.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessing || !selectedCountry}
                  className="w-full py-5 rounded-xl font-black uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
                  style={{ 
                    backgroundColor: isProcessing || !selectedCountry ? "#E8DCC4" : "#F4A261",
                    color: "#FFFFFF"
                  }}
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
                    `Complete Order • $${taxResult.total.toFixed(2)}`
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs" style={{ color: "#8B9CAE" }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold uppercase tracking-wide">Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}