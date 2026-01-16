"use client";

import React from "react";
import Link from "next/link";

const DevPage: React.FC = () => {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-6"
      style={{ backgroundColor: "#171010" }}
    >
      <div className="text-center">
        <div className="text-6xl mb-6">🚧</div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          UNDER
          <br />
          CONSTRUCTION
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          This page is getting a badass makeover
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 text-white font-bold text-sm tracking-wider transition-all transform hover:scale-105 cursor-pointer"
          style={{ backgroundColor: "#362222" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = "#423F3E")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = "#362222")
          }
        >
          BACK TO HOME
        </Link>
      </div>
    </main>
  );
};

export default DevPage;
