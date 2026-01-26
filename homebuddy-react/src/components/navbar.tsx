"use client";
// Note: Ensure the path to StaggeredMenu is correct
import StaggeredMenu, { StaggeredMenuItem, StaggeredMenuSocialItem } from "./StaggeredMenu";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";


// Define your menu items
const menuItems: StaggeredMenuItem[] = [
    { label: "SHOP", ariaLabel: "Go to the Shop page", link: "/shop" },
    /* { label: "COLLECTIONS", ariaLabel: "View all Collections", link: "/collections" }, */
    { label: "ABOUT", ariaLabel: "Learn about us", link: "/about" },
    { label: "CONTACT", ariaLabel: "Get in touch", link: "/contact" },
];

// Define your social items
const socialItems: StaggeredMenuSocialItem[] = [
    { label: "Instagram", link: "https://instagram.com/homebuddy" },
    { label: "Facebook", link: "https://facebook.com/homebuddy" },
    { label: "Twitter", link: "https://twitter.com/homebuddy" },
];


export default function Navbar() {
    // State to control the menu panel
    const [menuOpen, setMenuOpen] = useState(false);
    const overlayHandlerRef = useRef<(() => void) | null>(null);

    // Define a function to toggle the blur overlay in your layout
    const toggleBlurOverlay = (open: boolean) => {
        const overlay = document.getElementById("blurOverlay");
        if (overlay) {
            // Remove old listener if exists
            if (overlayHandlerRef.current) {
                overlay.removeEventListener('click', overlayHandlerRef.current);
                overlayHandlerRef.current = null;
            }

            if (open) {
                overlay.style.opacity = "1";
                overlay.style.pointerEvents = "auto";

                // Create and attach new click handler
                overlayHandlerRef.current = () => {
                    handleMenuClose();
                };
                overlay.addEventListener('click', overlayHandlerRef.current);
            } else {
                overlay.style.opacity = "0";
                overlay.style.pointerEvents = "none";
            }
        }
    }

    useEffect(() => {
        return () => {
            const overlay = document.getElementById("blurOverlay");
            if (overlay && overlayHandlerRef.current) {
                overlay.removeEventListener('click', overlayHandlerRef.current);
            }
        };
    }, []);

    // Callbacks for side effects (like blurring the background)
    const handleMenuOpen = useCallback(() => {
        setMenuOpen(true);
        toggleBlurOverlay(true);
        // Add logic to disable body scrolling if needed
    }, []);

    const handleMenuClose = useCallback(() => {
        setMenuOpen(false);
        toggleBlurOverlay(false);
        // Add logic to re-enable body scrolling if needed
    }, []);

    // Main toggle function
    const toggleMenu = useCallback(() => {
        if (menuOpen) {
            handleMenuClose();
        } else {
            handleMenuOpen();
        }
    }, [menuOpen, handleMenuClose, handleMenuOpen]);


    // Configuration for the Menu Button styles - UPDATED FOR HOMEBUDDY THEME
    const menuButtonColor = "#2D3E50"; // Navy for closed state
    const openMenuButtonColor = "#FFFFFF"; // White when open (to contrast cream panel)

    return (
        <>
            {/* The Unified Fixed Header: Z-index must be higher than StaggeredMenu (z-60 > z-40) */}
            <header className="fixed top-0 left-0 w-full p-6 z-60 flex items-center justify-between pointer-events-none">

                {/* 1. Logo/Branding on the left */}
                <Link className="flex items-center select-none pointer-events-auto hover:scale-101" href="/">
                    <img
                        src="/homebuddy-logo.svg"
                        alt="Logo"
                        className={`block h-8 w-auto object-contain transition-filter duration-300`}
                        draggable={false}
                        width={110}
                        height={24}
                    />
                </Link>

                {/* 2. Action Buttons and Menu Toggle on the right */}
                <div className="flex items-center gap-4 pointer-events-auto">

                    {/* Cart and Login are now seamlessly integrated into the main header area */}

                    {/* Menu Toggle Button - UPDATED COLORS */}
                    <button
                        className={`sm-toggle relative inline-flex items-center gap-[0.3rem] bg-transparent border-0 cursor-pointer font-medium leading-none overflow-visible transition-colors duration-300`}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        onClick={toggleMenu}
                        type="button"
                        style={{ color: menuOpen ? openMenuButtonColor : menuButtonColor }}
                    >
                        {/* Text label that changes */}
                        <span className="font-bold tracking-wider" style={{ color: menuOpen ? openMenuButtonColor : menuButtonColor }}>
                            {menuOpen ? 'CLOSE' : 'MENU'}
                        </span>

                        {/* Animated Cross Icon (Simple CSS transition for the plus sign) */}
                        <span className="relative w-3.5 h-3.5 shrink-0 inline-flex items-center justify-center">
                            {/* Horizontal Line */}
                            <span
                                className={`absolute left-1/2 top-1/2 w-full h-0.5 bg-current rounded-xs -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ease-out ${menuOpen ? 'rotate-45' : 'rotate-0'}`}
                                style={{ backgroundColor: menuOpen ? openMenuButtonColor : menuButtonColor }}
                            />
                            {/* Vertical Line */}
                            <span
                                className={`absolute left-1/2 top-1/2 w-full h-0.5 bg-current rounded-xs -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ease-out ${menuOpen ? '-rotate-45' : 'rotate-90'}`}
                                style={{ backgroundColor: menuOpen ? openMenuButtonColor : menuButtonColor }}
                            />
                        </span>
                    </button>
                </div>
            </header>

            {/* The Controlled Menu Panel - UPDATED COLORS FOR HOMEBUDDY */}
            <StaggeredMenu
                isFixed={true}
                items={menuItems}
                socialItems={socialItems}
                displaySocials={true}
                position="right"
                logoUrl="/homebuddy-logo.svg"
                accentColor="#F4A261" // Orange accent instead of dark red
                colors={['#FFFFFF', '#FAF3E0', '#F4A261']} // White, Cream, Orange instead of dark colors
                className="top-0 z-50 w-full h-screen"

                // CONTROL PROPS
                open={menuOpen}
                onToggle={toggleMenu} // Passed to close menu when an item is clicked

                // The component now handles the play/close animation internally based on 'open' prop change.
                onMenuOpen={toggleBlurOverlay.bind(null, true)}
                onMenuClose={toggleBlurOverlay.bind(null, false)}
            />
        </>
    );
}