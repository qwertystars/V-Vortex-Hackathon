"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OTP() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', { hour12: false }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock verification
        router.push("/dashboard/member"); // Assuming member for demo, or logic to route based on context
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-mono">
            {/* Marquee */}
            <div className="bg-primary text-black font-bold text-xs py-1 overflow-hidden whitespace-nowrap">
                <div className="animate-marquee inline-block">
                    ⚡ BATTLE CODE DEPLOYED • ENTER THE AUTH GATE • BECOME UNSTOPPABLE • ⚡ BATTLE CODE DEPLOYED • ENTER THE AUTH GATE • BECOME UNSTOPPABLE •
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                <div className="max-w-md w-full">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-black mb-2 tracking-tighter">V-VORTEX</h1>
                        <p className="text-gray-500 text-sm tracking-[0.2em]">⟨ ENTER YOUR 6-DIGIT AUTHENTICATION CODE ⟩</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-primary text-xs font-bold mb-4 tracking-wider">▸ BATTLE AUTH CODE</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="w-full bg-transparent border-b-2 border-white/20 text-center text-5xl font-bold py-4 focus:border-white focus:outline-none tracking-[1rem] placeholder-white/10"
                                placeholder="XXXXXX"
                            />
                            <p className="text-gray-600 text-xs mt-4 text-center">– Found in your mission control center</p>
                        </div>

                        <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-all clip-path-polygon">
                            🌀 VERIFY & DIVE INTO THE VORTEX 🌀
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <Link href="/login" className="text-gray-500 text-xs hover:text-white transition-colors">
                            ⟨ REGROUP • GO BACK ⟩
                        </Link>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="border-t border-white/10 p-4 flex justify-between items-center text-[10px] md:text-xs text-gray-500 tracking-widest uppercase">
                <span>AUTH GATE: <span className="text-green-500">ACTIVE</span></span>
                <span>SYSTEM TIME: {time}</span>
                <span className="hidden md:inline">MISSION LOG: STANDBY...</span>
            </div>
        </div>
    );
}
