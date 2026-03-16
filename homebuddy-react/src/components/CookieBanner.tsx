"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "homebuddy-cookie-consent-v1";

type ConsentChoice = "accepted" | "rejected";

interface StoredConsent {
  choice: ConsentChoice;
  timestamp: string;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setVisible(true);
        return;
      }
      const parsed = JSON.parse(raw) as StoredConsent;
      if (!parsed?.choice) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const storeChoice = (choice: ConsentChoice) => {
    if (typeof window === "undefined") return;
    const payload: StoredConsent = {
      choice,
      timestamp: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const handleAccept = () => {
    storeChoice("accepted");
    setVisible(false);
  };

  const handleReject = () => {
    storeChoice("rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-4 sm:pb-6">
      <div className="max-w-3xl w-full rounded-2xl border px-5 py-4 sm:px-6 sm:py-5 shadow-2xl bg-[#171010]/95 border-[#362222] backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-semibold text-white">
              Cookies & privacy
            </p>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              We use cookies to keep your cart, remember your login and understand how our shop is used.{" "}
              You can choose which cookies you allow in our{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-white">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/cookies" className="underline underline-offset-2 hover:text-white">
                Cookie Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={handleReject}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-[#423F3E] text-gray-200 hover:bg-[#211111] transition-colors"
            >
              Only necessary
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-black bg-[#F4A261] hover:bg-[#f28a33] transition-colors"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

