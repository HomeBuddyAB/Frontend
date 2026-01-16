"use client";
import { useState } from "react";
import CartDrawer from "./CartDrawer";
import { useCart } from "@/contexts/CartContext";

export default function CartButton() {
    const { totalItems } = useCart();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full">
            <button
                className="relative w-full px-5 py-3 text-sm font-bold text-white border-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 group overflow-hidden"
                style={{
                    borderColor: "#362222",
                    backgroundColor: "#2B2B2B",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#362222";
                    e.currentTarget.style.borderColor = "#8B4545";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2B2B2B";
                    e.currentTarget.style.borderColor = "#362222";
                }}
                onClick={() => setIsOpen(true)}
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-lg">🛒</span>
                    <span className="tracking-wider">CART</span>
                    {totalItems > 0 && (
                        <span
                            className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full"
                            style={{ backgroundColor: "#8B4545" }}
                        >
                            {totalItems}
                        </span>
                    )}
                </span>

                {/* Animated hover overlay */}
                <span
                    className="absolute inset-0 w-0 transition-all duration-300 ease-out group-hover:w-full"
                    style={{ backgroundColor: "rgba(139, 69, 69, 0.15)" }}
                />
            </button>

            <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    );
}