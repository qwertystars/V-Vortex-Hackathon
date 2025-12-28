"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function Register() {
    const [isVit, setIsVit] = useState(true);
    const [registered, setRegistered] = useState(false);
    const [loading, setLoading] = useState(false);
    const audioRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setRegistered(true);
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.log("Audio play failed", e));
            }
        }, 1500);
    };

    if (registered) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-6">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-black z-0" />
                <div className="relative z-10 max-w-lg w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center animate-fadeInUp">
                    <h1 className="text-3xl font-bold text-white mb-4">🔥 TEAM LEADER REGISTERED 🔥</h1>
                    <p className="text-gray-300 mb-8">
                        You&apos;ve successfully registered as a TEAM LEADER. Login to your dashboard and use the &quot;Build Your Team&quot; feature to add your team members and complete your registration.
                    </p>
                    <Link href="/login" className="block w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all">
                        Login to Dashboard
                    </Link>
                </div>
                <audio ref={audioRef} src="/vortex_music.m4a" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center bg-black text-white relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black -z-10" />

            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Panel */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-2">Team Leader Registration</h2>
                        <h1 className="text-5xl font-black text-white mb-4">V-VORTEX</h1>
                        <p className="text-gray-400 leading-relaxed">
                            Register as a team leader to begin your journey. After registration, you'll build your team by adding 1-4 members in your dashboard.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            "Step 1: Register as team leader",
                            "Step 2: Login to your dashboard",
                            "Step 3: Build your team with 2-5 total members"
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-black font-bold rounded-full">{i + 1}</span>
                                <span className="font-medium text-gray-200">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Form */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                        <span>🛡️</span> Team Leader Registration
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Toggle */}
                        <div className="p-1 bg-black/40 rounded-lg flex">
                            <button
                                type="button"
                                onClick={() => setIsVit(true)}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isVit ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"}`}
                            >
                                Yes, VIT Chennai
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsVit(false)}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isVit ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"}`}
                            >
                                No, Other College
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold ml-1 mb-1 block">Your Name</label>
                                <input required type="text" className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" placeholder="Enter full name" />
                            </div>

                            {isVit && (
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-bold ml-1 mb-1 block">Registration Number</label>
                                    <input required type="text" className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" placeholder="e.g. 24BCE1234" />
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold ml-1 mb-1 block">Email Address</label>
                                <input required type="email" className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" placeholder="official@email.com" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold ml-1 mb-1 block">Payment Receipt Link (Drive)</label>
                                <p className="text-xs text-gray-500 mb-2">Upload your payment receipt to Google Drive and share the link with view access.</p>
                                <input required type="url" className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" placeholder="https://drive.google.com/..." />
                            </div>
                        </div>

                        <button disabled={loading} type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-4">
                            {loading ? "Registering..." : "⚔️ REGISTER AS TEAM LEADER"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
