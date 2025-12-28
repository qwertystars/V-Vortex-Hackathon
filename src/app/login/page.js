"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    const [role, setRole] = useState("leader");
    const [time, setTime] = useState("");
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const handleModalOk = () => {
        // Route based on role for demo purposes
        if (role === "leader") {
            router.push("/dashboard/leader");
        } else {
            router.push("/otp"); // Members might go to OTP first? Or simple Login flow. User request "Verify -> A battle code has been dispatched. Click OK to enter the auth gate." implies OTP flow.
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-mono">
            {/* Marquee */}
            <div className="bg-white text-black font-bold text-xs py-1 overflow-hidden whitespace-nowrap">
                <div className="animate-marquee inline-block">
                    ⚡ 24 HOURS TO LEGENDARY STATUS • CODE LIKE YOUR DREAMS DEPEND ON IT • BUILD THE IMPOSSIBLE • SLEEP IS FOR THE WEAK • YOUR SQUAD, YOUR LEGACY • BREAK LIMITS, NOT RULES •
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 relative">
                <div className="max-w-lg w-full bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 relative">
                    {/* Decorative corners */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />

                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-black mb-2 tracking-tighter">V-VORTEX</h1>
                        <p className="text-gray-400 text-xs tracking-[0.3em]">⟨ WARRIORS ASSEMBLE • THE ARENA AWAITS ⟩</p>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 p-4 mb-8 text-center hidden">
                        <p className="text-red-400 text-xs mb-2">Team leader account not found.</p>
                        <div className="flex justify-center gap-4 text-xs font-bold">
                            <Link href="/register" className="text-white hover:underline">Register as Team Leader</Link>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-gray-500 text-xs font-bold mb-4 tracking-wider">▸ WARRIOR CLASS</label>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setRole("leader")} className={`flex-1 py-3 border ${role === "leader" ? "bg-white text-black border-white" : "border-white/20 text-gray-500 hover:border-white/50"} font-bold uppercase text-xs tracking-wider transition-all`}>
                                    Team Leader
                                </button>
                                <button type="button" onClick={() => setRole("member")} className={`flex-1 py-3 border ${role === "member" ? "bg-white text-black border-white" : "border-white/20 text-gray-500 hover:border-white/50"} font-bold uppercase text-xs tracking-wider transition-all`}>
                                    Team Member
                                </button>
                            </div>
                            <p className="text-gray-600 text-[10px] mt-2 text-right">– Your designation in the squad</p>
                        </div>

                        <div>
                            <label className="block text-gray-500 text-xs font-bold mb-4 tracking-wider">
                                {role === "leader" ? "▸ TEAM LEADER EMAIL ID" : "▸ MEMBER EMAIL ID"}
                            </label>
                            <input required type="email" className="w-full bg-transparent border-b border-white/20 py-3 text-xl focus:border-white focus:outline-none transition-colors" placeholder="champion@institute.edu" />
                            <p className="text-gray-600 text-[10px] mt-2 text-right">– Your official battle credentials</p>
                        </div>

                        <button className="w-full py-4 bg-primary text-black font-bold uppercase tracking-widest hover:brightness-110 transition-all mt-4">
                            ⚡ ENTER THE ARENA • SEND BATTLE CODE ⚡
                        </button>
                    </form>
                </div>
            </div>

            {/* Status Bar */}
            <div className="border-t border-white/10 p-4 flex justify-between items-center text-[10px] md:text-xs text-gray-500 tracking-widest uppercase">
                <span>ARENA STATUS: <span className="text-green-500 animate-pulse">LIVE & ELECTRIC</span></span>
                <span>SYSTEM TIME: {time}</span>
                <span className="hidden md:inline">LEGENDS IN THE MAKING: LOADING...</span>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/20 p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">📧</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Verify</h3>
                        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                            A battle code has been dispatched. Click OK to enter the auth gate.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-white/20 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-wider">Cancel</button>
                            <button onClick={handleModalOk} className="flex-1 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-gray-200">OK</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
