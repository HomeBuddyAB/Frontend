"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#171010] text-gray-100 pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-2">
            Legal
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-sm text-gray-300">
            These terms govern your use of the HomeBuddy web shop and all purchases made through the site.
          </p>
        </div>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">1. Scope</h2>
          <p>
            By creating an account, browsing products or placing an order you accept these Terms &amp; Conditions.
            If you do not agree, you should not use this website.
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">2. Orders & payment</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-200">
            <li>An order is binding once you receive an order confirmation on screen.</li>
            <li>All prices are shown in the selected currency and include VAT where applicable.</li>
            <li>
              Payment is handled via our payment provider. Your card details are processed securely and are not stored
              by HomeBuddy.
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">3. Shipping & delivery</h2>
          <p>
            We ship orders to the delivery address you provide at checkout. Estimated delivery times and available
            shipping options are shown before you confirm your order.
          </p>
          <p>
            For more information about shipping and returns, see our{" "}
            <Link href="/shipping" className="underline underline-offset-2 text-gray-100">
              Shipping
            </Link>{" "}
            and{" "}
            <Link href="/returns" className="underline underline-offset-2 text-gray-100">
              Returns
            </Link>{" "}
            pages.
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">4. Right of withdrawal & returns</h2>
          <p>
            As a consumer you may have a legal right to withdraw from your purchase within a certain period after
            receiving your order. Returned products must be unused and in sellable condition.
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">5. Accounts & security</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-200">
            <li>You are responsible for keeping your login details confidential.</li>
            <li>
              You must notify us immediately if you suspect unauthorised access to your account so we can help you
              secure it.
            </li>
            <li>
              You can delete your account at any time from your{" "}
              <Link href="/profile" className="underline underline-offset-2 text-gray-100">
                profile page
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-white">6. Privacy</h2>
          <p>
            How we handle your personal data is described in our{" "}
            <Link href="/privacy" className="underline underline-offset-2 text-gray-100">
              Privacy Policy
            </Link>
            . Please read it carefully.
          </p>
        </section>
      </div>
    </main>
  );
}

