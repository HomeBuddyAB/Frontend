"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import { analytics } from "@/lib/analytics";
import { useRouter } from "next/navigation";

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = isOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isOpen, mounted]);

  useEffect(() => {
    if (isOpen && items.length > 0) {
      const totalValue = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      analytics.viewCart(totalValue, items.length);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 w-screen h-screen bg-black transition-opacity duration-300 z-999 ${
          isOpen
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Desktop: Slide from right */}
      <div
        className={`not-sm:hidden fixed top-0 right-0 h-screen w-full sm:w-96 shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-1000 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "#1a1a1a",
          borderLeft: "2px solid #362222",
        }}
        aria-hidden={!isOpen}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div
            className="px-6 py-6 border-b"
            style={{ borderColor: "#362222" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">YOUR CART</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-400 text-lg">Your cart is empty</p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2 text-sm font-bold text-white transition-all"
                  style={{ backgroundColor: "#8B4545" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#9B5555")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#8B4545")
                  }
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.sku}
                      className="flex gap-4 border-b pb-4"
                      style={{ borderColor: "#362222" }}
                    >
                      {/* Image */}
                      <div className="w-20 h-20 bg-gray-800 rounded shrink-0 overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-sm truncate">
                          {item.name}
                        </h3>
                        <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                          {item.color && <div>Color: {item.color}</div>}
                          {item.size && <div>Size: {item.size}</div>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-white font-bold">
                            ${item.price.toFixed(2)}
                          </span>
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => (
                                analytics.adjustItemQuantity({
                                  sku: item.sku.toString(),
                                  name: item.name,
                                  price: item.price,
                                  quantity: item.quantity - 1,
                                }),
                                updateQuantity(item.sku, item.quantity - 1)
                              )}
                              className="w-6 h-6 flex items-center justify-center text-white border border-gray-600 hover:border-gray-400 transition-colors"
                            >
                              -
                            </button>
                            <span className="text-white w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                analytics.adjustItemQuantity({
                                  sku: item.sku.toString(),
                                  name: item.name,
                                  price: item.price,
                                  quantity: item.quantity + 1,
                                });
                                updateQuantity(item.sku, item.quantity + 1);
                              }}
                              className="w-6 h-6 flex items-center justify-center text-white border border-gray-600 hover:border-gray-400 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => {
                          analytics.removeFromCart({
                            sku: item.sku.toString(),
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                          });
                          removeItem(item.sku);
                        }}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Clear Cart */}
                {items.length > 0 && (
                  <button
                    onClick={() => {
                      analytics.clearCart();
                      clearCart();
                    }}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors mt-4"
                  >
                    Clear Cart
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div
              className="px-6 py-6 border-t space-y-4"
              style={{ borderColor: "#362222" }}
            >
              <div className="flex justify-between text-lg">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-white font-bold">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                className="cursor-pointer w-full py-3 text-white font-bold rounded transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ backgroundColor: "#8B4545" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#9B5555")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#8B4545")
                }
                onClick={handleCheckout}
              >
                CHECKOUT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div
        className={`sm:hidden fixed bottom-0 left-0 right-0 w-full shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-1000 rounded-t-2xl ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          backgroundColor: "#1a1a1a",
          borderTop: "2px solid #362222",
          maxHeight: "85vh",
        }}
        aria-hidden={!isOpen}
      >
        <div className="h-full flex flex-col">
          <div className="pt-3 pb-2 flex justify-center">
            <div
              className="w-12 h-1 rounded-full"
              style={{ backgroundColor: "#362222" }}
            />
          </div>

          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: "#362222" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">YOUR CART</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🛒</div>
                <p className="text-gray-400">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.sku}
                    className="flex gap-3 border-b pb-4"
                    style={{ borderColor: "#362222" }}
                  >
                    <div className="w-16 h-16 bg-gray-800 rounded shrink-0 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm truncate">
                        {item.name}
                      </h3>
                      <div className="text-xs text-gray-400 mt-1">
                        {item.color && <span>Color: {item.color} </span>}
                        {item.size && <span>• Size: {item.size}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-white font-bold text-sm">
                          ${item.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.sku, item.quantity - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center text-white border border-gray-600"
                          >
                            -
                          </button>
                          <span className="text-white w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.sku, item.quantity + 1)
                            }
                            className="w-6 h-6 flex items-center justify-center text-white border border-gray-600"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        analytics.removeFromCart({
                          sku: item.sku.toString(),
                          name: item.name,
                          price: item.price,
                          quantity: item.quantity,
                        });
                        removeItem(item.sku);
                      }}
                      className="text-gray-400"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div
              className="px-6 py-4 border-t space-y-3"
              style={{ borderColor: "#362222" }}
            >
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-white font-bold">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                className="cursor-pointer w-full py-3 text-white font-bold rounded transition-all duration-300 active:scale-95"
                style={{ backgroundColor: "#8B4545" }}
                onClick={handleCheckout}
              >
                CHECKOUT
              </button>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
