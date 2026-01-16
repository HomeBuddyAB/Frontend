"use client";
import Link from "next/link";
// Using the same CSS keyframes from the 404 example

export default function GeneralError({ errorMessage = "A critical system fault has occurred." }) {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden" style={{ backgroundColor: "#171010" }}>

            {/* Scan Line Overlay for texture */}
            <div className="scan-line absolute inset-0 z-0"></div>

            <div className="max-w-2xl text-center relative z-10 p-8">

                {/* ERROR Text with Glitch Effect */}
                <h1
                    className="text-8xl md:text-[8rem] font-extrabold text-red-600 mb-4 glitch-text tracking-wider"
                    style={{ lineHeight: 1, filter: 'drop-shadow(2px 2px 0 #171010)' }} // Red error color, subtle shadow
                >
                    ERROR
                </h1>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-widest border-b border-t py-2 inline-block"
                    style={{ borderColor: "#423F3E" }}
                >
                    SYSTEM INTERFERENCE
                </h2>

                <p className="text-lg md:text-xl text-red-400 mb-3 max-w-lg mx-auto">
                    {errorMessage}
                </p>

                <p className="text-base text-gray-400 mb-10 max-w-lg mx-auto">
                    Something went sideways. Try reloading, or if you're stuck, head back to home base.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {/* Reload Button - Primary Action */}
                    <button
                        className="px-8 py-4 text-white font-bold text-sm tracking-wider transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-gray-700/50 flex items-center justify-center hover:cursor-pointer hover:transition-all hover:bg-[#2B2B2B]"
                        style={{ backgroundColor: "#362222" }}
                        onClick={() => window.location.reload()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 15m15.356-2a8.001 8.001 0 01-14.588 5M4 12a8 8 0 0116 0" />
                        </svg>
                        RELOAD PAGE
                    </button>

                    {/* Go Home Button - Secondary Action */}
                    <Link href="/">
                        <button
                            className="px-8 py-4 text-white font-medium text-sm tracking-wider border transition-colors duration-300 hover:bg-[#2B2B2B] hover:scale-105 hover:shadow-lg hover:shadow-gray-700/50 hover:transition-all hover:cursor-pointer"
                            style={{ borderColor: "#423F3E", backgroundColor: "transparent" }}
                        >
                            GO BACK HOME
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}