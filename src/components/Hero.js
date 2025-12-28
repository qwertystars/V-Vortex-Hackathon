"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Hero() {
    const videoRef = useRef(null);

    useEffect(() => {
        // Force play for autoplay policies if needed
        if (videoRef.current) {
            videoRef.current.play().catch((error) => {
                console.log("Video autoplay failed:", error);
            });
        }
    }, []);

    return (
        <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
            {/* Background Video */}
            <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-cover"
                src="/secondpart_fixed.mp4"
                autoPlay
                loop
                muted
                playsInline
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20" />

            {/* Content */}
            <div className="relative z-30 text-center px-4 max-w-5xl mx-auto flex flex-col items-center gap-6 animate-fadeInUp">
                {/* <Image
            src="/logo.jpg"
            alt="V-Vortex Logo"
            width={120}
            height={120}
            className="rounded-full shadow-2xl mb-4"
          /> */}
                <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-secondary drop-shadow-2xl">
                    V-VORTEX
                </h1>
                <p className="text-2xl md:text-4xl font-bold text-white tracking-wide mt-2">
                    UNLEASH YOUR INNOVATION
                </p>
                <p className="text-lg md:text-xl text-gray-300 font-light tracking-wide max-w-3xl leading-relaxed">
                    The ultimate national-level hackathon from VIT Chennai where champions are forged, ideas become reality, and innovation knows no bounds. Join us for 24 hours of pure adrenaline, groundbreaking solutions, and the chance to etch your name in the hall of legends.
                </p>

                <div className="flex flex-col md:flex-row items-center gap-4 mt-8 w-full md:w-auto px-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-full md:w-auto justify-center md:justify-start">
                        <span className="text-secondary text-2xl">📍</span>
                        <div className="text-left">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">VENUE</p>
                            <p className="font-bold text-white">VIT Chennai</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-full md:w-auto justify-center md:justify-start">
                        <span className="text-primary text-2xl">📅</span>
                        <div className="text-left">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">DATES</p>
                            <p className="font-bold text-white text-sm">07th - 08th Jan (Idea)</p>
                            <p className="font-bold text-white text-sm">09th - 10th Jan (Hack)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-full md:w-auto justify-center md:justify-start">
                        <span className="text-yellow-400 text-2xl">⚡</span>
                        <div className="text-left">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">LEVEL</p>
                            <p className="font-bold text-white">National</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex gap-6">
                    <Link
                        href="/register"
                        className="px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        Register Now
                    </Link>
                    <Link
                        href="#about"
                        className="px-8 py-4 border border-white/30 bg-black/20 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:bg-white/10 transition-colors"
                    >
                        Learn More
                    </Link>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
                <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
}
