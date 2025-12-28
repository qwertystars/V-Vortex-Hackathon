"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LeaderDashboard() {
    const [activeTab, setActiveTab] = useState("hub");
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const sidebarItems = [
        { id: "hub", label: "Vortex Hub" },
        { id: "build", label: "Build Your Team" },
        { id: "leaderboard", label: "Leaderboard" },
        { id: "nexus", label: "Nexus Entry" },
        { id: "mission", label: "The Mission" },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex text-sm">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col fixed h-full bg-black z-20">
                <div className="p-6 border-b border-white/10">
                    <h1 className="font-black text-xl tracking-tighter italic">HACKVORTEX</h1>
                    <p className="text-[10px] text-primary tracking-widest mt-1">ALPHA SECTOR</p>
                </div>
                <div className="flex-1 py-6 px-3 space-y-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === item.id
                                    ? "bg-white text-black shadow-lg"
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <div className="p-6 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center font-bold text-xs">AC</div>
                        <div>
                            <p className="text-xs font-bold text-white">Alex Chen</p>
                            <p className="text-[10px] text-gray-500 uppercase">Team Leader</p>
                        </div>
                    </div>
                    <Link href="/login" className="block text-[10px] text-red-500 hover:text-red-400 font-bold tracking-widest">
                        DISCONNECT
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-12 pb-6 border-b border-white/5">
                    <div>
                        <h2 className="text-2xl font-bold uppercase tracking-wide">{sidebarItems.find(i => i.id === activeTab)?.label}</h2>
                        <p className="text-gray-500 text-[10px] tracking-widest mt-1">OPERATIONAL OBJECTIVE DECRYPTION</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 tracking-widest">SYSTEM TIME</p>
                        <p className="text-lg font-mono text-primary">{time}</p>
                    </div>
                </header>

                {/* Content Area */}
                <div className="max-w-5xl animate-fadeIn">

                    {/* Build Team Prompt - Always visible if condition met (simulated always met for demo) */}
                    <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl p-6 mb-12 flex items-center gap-6">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-2xl">
                            🔨
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-yellow-500 mb-1">Build Your Team First!</h3>
                            <p className="text-gray-400 text-xs">Your team is not complete yet. Click here to add members and set your team name.</p>
                        </div>
                        <button onClick={() => setActiveTab("build")} className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors text-xs uppercase tracking-wider">
                            Go to Build Your Team →
                        </button>
                    </div>

                    {activeTab === "hub" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div onClick={() => setActiveTab("leaderboard")} className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-1">
                                <span className="text-3xl mb-4 block">↗</span>
                                <h3 className="font-bold text-lg mb-2">Leaderboard</h3>
                                <p className="text-gray-400 text-xs">Analyze the competitive landscape and track your climb.</p>
                            </div>
                            <div onClick={() => setActiveTab("nexus")} className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-1">
                                <span className="text-3xl mb-4 block">⌁</span>
                                <h3 className="font-bold text-lg mb-2">Nexus Entry</h3>
                                <p className="text-gray-400 text-xs">Generate encrypted access credentials.</p>
                            </div>
                            <div onClick={() => setActiveTab("mission")} className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-1">
                                <span className="text-3xl mb-4 block">💡</span>
                                <h3 className="font-bold text-lg mb-2">The Mission</h3>
                                <p className="text-gray-400 text-xs">Decrypt objectives and evaluation matrix.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "build" && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center min-h-[400px] flex items-center justify-center">
                            <p className="text-gray-400">Team Building Interface [Placeholder]</p>
                        </div>
                    )}

                    {activeTab === "leaderboard" && (
                        <div className="space-y-8">
                            {/* Team Summary */}
                            <div className="bg-gradient-to-r from-purple-900/20 to-transparent border border-purple-500/20 rounded-2xl p-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1">NullPointers</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            <span className="text-[10px] text-green-500 uppercase tracking-widest font-bold">ELITE SQUAD · LIVE RANKING</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">CURRENT YIELD</p>
                                        <p className="text-4xl font-black text-white">8,450 <span className="text-sm font-medium text-gray-500">PTS</span></p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/5">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">TACTICAL RANK</p>
                                        <p className="text-xl font-bold text-white">#04<span className="text-gray-600 text-sm font-normal">/128</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">ACCUMULATED DATA</p>
                                        <p className="text-xl font-bold text-white">84%</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">GAP TO ALPHA</p>
                                        <p className="text-xl font-bold text-red-400">- 420 PTS</p>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10 text-xs">
                                <table className="w-full text-left">
                                    <thead className="bg-black text-gray-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="p-4 font-bold">Position</th>
                                            <th className="p-4 font-bold">Squad Designation</th>
                                            <th className="p-4 font-bold text-right">Payload</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[{ rank: 1, name: "ULTRA-1", score: "9,800" }, { rank: 2, name: "ELITE-2", score: "9,250" }, { rank: 3, name: "APEX-3", score: "8,900" }, { rank: 4, name: "NullPointers", score: "8,450", active: true }, { rank: 5, name: "CodeBreakers", score: "8,100" }].map((row) => (
                                            <tr key={row.rank} className={row.active ? "bg-primary/10" : "hover:bg-white/5"}>
                                                <td className="p-4 font-bold text-white">#{row.rank.toString().padStart(2, '0')}</td>
                                                <td className="p-4 text-gray-300 flex items-center gap-2">
                                                    {row.name}
                                                    {row.active && <span className="px-2 py-0.5 bg-primary text-black text-[9px] font-bold rounded uppercase">Your Squad</span>}
                                                </td>
                                                <td className="p-4 text-right font-mono text-white">{row.score} PTS</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "nexus" && (
                        <div className="bg-black border border-white/10 rounded-2xl p-12 text-center max-w-lg mx-auto">
                            <h3 className="text-gray-500 uppercase tracking-widest text-[10px] mb-8">SQUAD: NullPointers</h3>
                            <div className="w-48 h-48 bg-white mx-auto mb-8 p-2 rounded-lg">
                                {/* QR Placeholder */}
                                <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs font-mono break-all p-2 text-center">
                                    [QR CODE DATA STREAM]
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs mb-6 max-w-xs mx-auto">
                                Authorized personnel must scan this encrypted vortex key to gain access to the secure development environment.
                            </p>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-lg font-mono text-sm text-primary tracking-widest break-all">
                                HCK-2024-XJF92-EPSILON
                            </div>
                        </div>
                    )}

                    {activeTab === "mission" && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <h3 className="text-[10px] text-primary font-bold uppercase tracking-widest mb-4">OBJECTIVE PRIMARY</h3>
                            <h2 className="text-3xl font-bold text-white mb-8">Synthesize AI-Powered Eco-Intelligence</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-xs font-bold text-white uppercase mb-4 border-b border-white/10 pb-2">Requirements</h4>
                                    <ul className="space-y-3">
                                        {["Real-time neural tracking of carbon outputs", "Autonomous green-protocol recommendations", "IoT Matrix integration for global analytics"].map((req, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-400 text-xs">
                                                <span className="text-green-500 font-bold">✓</span>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white uppercase mb-4 border-b border-white/10 pb-2">Evaluation Matrix</h4>
                                    <div className="space-y-4">
                                        {[
                                            { label: "INNOVATION ALPHA", val: "30%", color: "bg-blue-500" },
                                            { label: "TECH EXECUTION", val: "40%", color: "bg-purple-500" },
                                            { label: "UI SYNAPSE", val: "30%", color: "bg-pink-500" }
                                        ].map((metric, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between items-center text-xs mb-1">
                                                    <span className="text-gray-400">{metric.label}</span>
                                                    <span className="font-bold text-white">{metric.val}</span>
                                                </div>
                                                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${metric.color}`} style={{ width: metric.val }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
