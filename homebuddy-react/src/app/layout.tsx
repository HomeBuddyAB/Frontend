import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import LoadingBar from "./LoadingBar";
// @ts-ignore: Allow side-effect import of global CSS without module declarations
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Bounce, ToastContainer } from "react-toastify";
import { CartProvider } from "@/contexts/CartContext";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomeBuddy - Alternative Fashion",
  description: "Premium biker, emo, and leather clothing",
};

// lets disable footer for specific pages like admin and checkout


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#171010" }}
      >
        <AuthProvider>
          <CartProvider>
            <Suspense>
              <LoadingBar />
              <div
                id="blurOverlay"
                className="fixed inset-0 w-full h-full backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
                style={{
                  zIndex: 39,
                  opacity: 0,
                  pointerEvents: 'none',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)'
                }}
              />
              <Navbar />
              {children}
              <ConditionalFooter />
              <ToastContainer
                position="top-left"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                transition={Bounce}
              />
            </Suspense>
          </CartProvider>
        </AuthProvider>
        <GoogleAnalytics gaId={process.env.GA_MEASUREMENT_ID || ""} />
      </body>
    </html >
  );
}