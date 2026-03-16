"use client";

import Link from "next/link";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#171010] text-gray-100 pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-2">
            Legal
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Cookie Policy
          </h1>
          <p className="mt-3 text-sm text-gray-300">
            This page explains what cookies we use on the HomeBuddy shop, what they are used for and how you can control them.
          </p>
        </div>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">1. What are cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website.
            They can help the site remember your actions and preferences over time.
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">2. Cookies we use</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-200">
            <li>
              <span className="font-semibold">Necessary cookies</span> – required to run the shop,
              keep you logged in, maintain your cart and protect against abuse.
            </li>
            <li>
              <span className="font-semibold">Preference cookies</span> – remember things like your
              chosen country or recently viewed items (if enabled).
            </li>
            <li>
              <span className="font-semibold">Analytics cookies</span> – help us understand how the site is used
              so we can improve performance and user experience.
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">3. Managing your consent</h2>
          <p>
            When you first visit the shop you will see a cookie banner where you can accept all cookies
            or choose to only allow necessary cookies.
          </p>
          <p>
            You can change your choice at any time by clearing cookies for this site in your browser and visiting again.
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">4. More information</h2>
          <p>
            For details on how we handle personal data collected via cookies, please read our{" "}
            <Link href="/privacy" className="underline underline-offset-2 text-gray-100">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

