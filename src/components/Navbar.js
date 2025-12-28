"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "V-VORTEX", href: "/#about" }, // Was About
        { name: "DOMAINS", href: "/#domains" },
        { name: "TIMELINE", href: "/#timeline" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
                ? "bg-black/80 backdrop-blur-md border-b border-white/10 py-3"
                : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    {/* <Image
            src="/logo.jpg"
            alt="V-Vortex Logo"
            width={40}
            height={40}
            className="rounded-full"
          /> */}
                    <span className="text-2xl font-bold tracking-tighter text-white">
                        V-Vortex
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-gray-300 hover:text-white hover:text-shadow-glow transition-colors text-sm font-medium uppercase tracking-wider"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link
                        href="/login"
                        className="text-gray-300 hover:text-white hover:text-shadow-glow transition-colors text-sm font-medium uppercase tracking-wider"
                    >
                        🌀 LOGIN
                    </Link>
                    <Link
                        href="/register"
                        className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all transform hover:-translate-y-0.5"
                    >
                        ⚡ REGISTER
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {menuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-6 items-center animate-fadeIn">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-gray-300 hover:text-white text-lg font-medium"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link
                        href="/register"
                        onClick={() => setMenuOpen(false)}
                        className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full w-full text-center"
                    >
                        Register Now
                    </Link>
                </div>
            )}
        </nav>
    );
}
