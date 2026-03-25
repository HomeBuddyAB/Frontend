"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

const CONSENT_KEY = "homebuddy-cookie-consent-v1";

type StoredConsent = { choice?: "accepted" | "rejected" };

export default function AnalyticsGate() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CONSENT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredConsent;
      setEnabled(parsed?.choice === "accepted");
    } catch {
      setEnabled(false);
    }
  }, []);

  const gaId = process.env.GA_MEASUREMENT_ID || "";
  if (!enabled || !gaId) return null;

  return <GoogleAnalytics gaId={gaId} />;
}

