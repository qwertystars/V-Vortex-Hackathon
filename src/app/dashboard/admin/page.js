"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono text-white">
                <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl">
                    <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        Admin Login
                    </h1>
                    <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-white/20 p-3 rounded text-sm focus:border-red-500 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-white/20 p-3 rounded text-sm focus:border-red-500 outline-none transition-colors"
                            />
                        </div>
                        <button type="submit" className="w-full py-3 bg-red-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-colors rounded">
                            Sign in as Admin
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-mono">
            {/* Navigation */}
            <nav className="border-b border-white/10 px-6 py-4 flex justify-between items-center bg-black">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="font-bold tracking-widest text-sm">ADMIN CONTROL PANEL</span>
                </div>
                <button onClick={() => setIsLoggedIn(false)} className="text-xs text-gray-500 hover:text-white uppercase tracking-wider">
                    Logout
                </button>
            </nav>

            <div className="p-6 md:p-10 max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">System Overview</h1>
                        <p className="text-gray-500 text-sm">Monitor network activity and security protocols.</p>
                    </div>
                    <button className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
                        Export Teams
                    </button>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-black border border-white/10 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Active Users</p>
                        <p className="text-3xl font-bold text-white">128</p>
                    </div>
                    <div className="bg-black border border-white/10 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Pending Requests</p>
                        <p className="text-3xl font-bold text-yellow-500">7</p>
                    </div>
                    <div className="bg-black border border-white/10 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider">System Health</p>
                        <p className="text-3xl font-bold text-green-500">Optimal</p>
                    </div>
                    <div className="bg-black border border-white/10 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Security Alerts</p>
                        <p className="text-3xl font-bold text-red-500">0</p>
                    </div>
                </div>

                {/* Logs Panel */}
                <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                        <h3 className="font-bold text-sm uppercase tracking-wider">Recent Activity Logs</h3>
                    </div>
                    <div className="p-6 space-y-4 text-sm font-mono">
                        <div className="flex gap-4">
                            <span className="text-gray-600">[10:42:15]</span>
                            <span className="text-gray-300">User <span className="text-primary">DEV01</span> logged in.</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-gray-600">[10:41:03]</span>
                            <span className="text-gray-300">Permission granted to <span className="text-secondary">TEAM-ALPHA</span>.</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-gray-600">[10:38:55]</span>
                            <span className="text-gray-300">New registration request: <span className="text-yellow-500">user_57</span>.</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-gray-600">[10:35:12]</span>
                            <span className="text-gray-300">System scan completed successfully.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
