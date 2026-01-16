"use client";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden" style={{ backgroundColor: "#171010" }}>

            <div className="scan-line absolute inset-0 z-0"></div>

            <div className="max-w-2xl text-center relative z-10 p-8">

                <h1
                    className="text-9xl md:text-[10rem] font-extrabold text-white mb-4 glitch-text tracking-widest"
                    style={{ lineHeight: 1 }}
                >
                    404
                </h1>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-wider border-b border-t py-2 inline-block"
                    style={{ borderColor: "#423F3E" }}
                >
                    PATH LOST IN THE DUST
                </h2>

                <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-lg mx-auto">
                    Looks like your connection to the grid has been severed. The page you sought is missing.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <button
                            className="px-8 py-4 text-white font-bold text-sm tracking-wider transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-gray-700/50 hover:cursor-pointer hover:transition-all hover:bg-[#2B2B2B]"
                            style={{ backgroundColor: "#362222" }}
                        >
                            RETURN TO BASE
                        </button>
                    </Link>
                    <Link href="/shop">
                        <button
                            className="px-8 py-4 text-white font-medium text-sm tracking-wider border transition-colors duration-300 hover:bg-[#2B2B2B] hover:scale-105 hover:shadow-lg hover:shadow-gray-700/50 hover:transition-all hover:cursor-pointer"
                            style={{ borderColor: "#423F3E", backgroundColor: "transparent" }}
                        >
                            BROWSE THE GEAR
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}