"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MemberDashboard() {
    const [activeTab, setActiveTab] = useState("identity");
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const sidebarItems = [
        { id: "terminal", label: "Developer Terminal" },
        { id: "identity", label: "Member Identity" },
        { id: "gate", label: "Access Gate" },
        { id: "logic", label: "Mission Logic" },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-mono flex text-sm">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col fixed h-full bg-black z-20">
                <div className="p-6 border-b border-white/10">
                    <h1 className="font-bold text-xl tracking-tighter">HACKVORTEX</h1>
                    <p className="text-[10px] text-gray-500 tracking-widest mt-1">DEV_TERMINAL_V2</p>
                </div>
                <div className="flex-1 py-6 px-3 space-y-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === item.id
                                    ? "bg-white text-black bg-opacity-100"
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <span className="mr-2">{activeTab === item.id ? ">" : " "}</span>
                            {item.label}
                        </button>
                    ))}
                </div>
                <div className="p-6 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center font-bold text-xs">JD</div>
                        <div>
                            <p className="text-xs font-bold text-white">John Doe</p>
                            <p className="text-[10px] text-gray-500 uppercase">NullPointers</p>
                        </div>
                    </div>
                    <Link href="/login" className="block text-[10px] text-red-500 hover:text-red-400 font-bold tracking-widest">
                        LOGOUT_SESSION
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-12 pb-6 border-b border-white/5">
                    <div>
                        <h2 className="text-2xl font-bold uppercase tracking-wide">{sidebarItems.find(i => i.id === activeTab)?.label}</h2>
                        <p className="text-green-500 text-[10px] tracking-widest mt-1">AUTHENTICATED SESSION</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 tracking-widest">SYSTEM PULSE</p>
                        <p className="text-lg font-mono text-white">{time}</p>
                    </div>
                </header>

                <div className="max-w-4xl animate-fadeIn">
                    {activeTab === "identity" && (
                        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-lg">
                            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
                                <div className="w-24 h-24 bg-gray-800 rounded-full"></div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">John Doe</h3>
                                    <p className="text-primary text-xs uppercase tracking-widest mt-1">Backend Engineer</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between p-4 bg-black/50 rounded-lg">
                                    <span className="text-gray-500 text-xs uppercase tracking-widest">Squad</span>
                                    <span className="text-white font-bold">NullPointers</span>
                                </div>
                                <div className="flex justify-between p-4 bg-black/50 rounded-lg">
                                    <span className="text-gray-500 text-xs uppercase tracking-widest">Email</span>
                                    <span className="text-white font-bold">john.d@example.com</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "gate" && (
                        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                            <h3 className="text-lg font-bold text-white mb-6">Gateway Access</h3>
                            <div className="p-6 bg-black/50 border border-white/10 rounded-xl mb-6 flex justify-between items-center">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase mb-1">Assigned Team</p>
                                    <p className="text-white font-bold">NullPointers</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 text-xs uppercase mb-1">Status</p>
                                    <p className="text-green-500 font-bold">GRANTED</p>
                                </div>
                            </div>
                            <button className="w-full py-3 border border-white/20 text-white font-bold hover:bg-white/5 rounded-xl uppercase text-xs tracking-widest transition-colors">
                                Export Session Credential
                            </button>
                        </div>
                    )}

                    {activeTab === "logic" && (
                        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                            <div className="mb-6">
                                <span className="inline-block px-2 py-1 bg-primary text-black text-[10px] font-bold rounded uppercase mb-2">Problem Statement</span>
                                <h3 className="text-2xl font-bold text-white">Synthesize AI-Powered Eco-Intelligence</h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                Develop a system capable of tracking carbon outputs in real-time using neural networks and providing actionable insights for reduction.
                            </p>
                            <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors text-xs uppercase tracking-widest">
                                Initialize Mission Workspace
                            </button>
                        </div>
                    )}

                    {activeTab === "terminal" && (
                        <div className="bg-black border border-white/10 p-4 rounded-xl font-mono text-xs h-64 overflow-y-auto">
                            <p className="text-green-500">$ init_dev_env</p>
                            <p className="text-white">Loading modules...</p>
                            <p className="text-white">Connecting to mesh network... <span className="text-green-500">OK</span></p>
                            <p className="text-white">Syncing with Leaderboard... <span className="text-green-500">OK</span></p>
                            <p className="text-green-500">$ _</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
