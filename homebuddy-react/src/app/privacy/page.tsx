"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#171010] text-gray-100 pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-2">
            Legal
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-300">
            This page explains how we collect, use and protect your personal data when you use the HomeBuddy shop.
          </p>
        </div>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">1. Data controller</h2>
          <p>
            HomeBuddy AB is responsible for the processing of your personal data when you use this website,
            create an account or place an order.
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">2. What data we collect</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-200">
            <li>Account data (email address and password in hashed form).</li>
            <li>Order data (products, prices, delivery address, country).</li>
            <li>Customer data in your address book (name, phone, address, country).</li>
            <li>Technical data (IP address, browser, device, usage analytics).</li>
            <li>Cookie data (your cookie preferences, session identifiers, cart information).</li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">3. Why we process your data</h2>
          <p>We use your data to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-200">
            <li>Provide and operate the HomeBuddy shop and your user account.</li>
            <li>Handle orders, payments, deliveries and returns.</li>
            <li>Show your order history and favourites.</li>
            <li>Maintain security, prevent abuse and improve the service.</li>
            <li>Comply with legal obligations (e.g. accounting rules).</li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">4. Cookies & tracking</h2>
          <p>
            We use cookies that are necessary for the site to work (for example to keep your cart and login session),
            and analytics cookies to understand how our shop is used.
          </p>
          <p>
            You can control your consent to non‑essential cookies via the cookie banner at the bottom of the page.
            Necessary cookies cannot be turned off because the site would stop working.
          </p>
          <p>
            For more details, see our{" "}
            <Link href="/cookies" className="underline underline-offset-2 text-gray-100">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">5. How long we keep your data</h2>
          <p>
            We store your account data for as long as you have an account. You can delete your account at any time
            from the profile page; this will remove your login and address book. Order data may need to be retained
            for a longer period to comply with legal and accounting obligations.
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">6. Your rights (GDPR)</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-200">
            <li>Access the personal data we hold about you.</li>
            <li>Correct incorrect or incomplete data in your profile.</li>
            <li>Delete your account and associated profile data.</li>
            <li>
              Object to certain processing and withdraw consent to non‑essential cookies at any time.
            </li>
          </ul>
          <p>
            You can manage most of this directly via your{" "}
            <Link href="/profile" className="underline underline-offset-2 text-gray-100">
              account page
            </Link>
            . For anything else, please contact us via the{" "}
            <Link href="/contact" className="underline underline-offset-2 text-gray-100">
              contact form
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

