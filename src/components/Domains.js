"use client";

import { useState } from "react";

export default function Domains() {
    const domains = [
        {
            id: "aiml",
            title: "AI/ML",
            icon: "🤖",
            ps: "Developing intelligent systems that can learn, adapt, and solve complex problems through data-driven approaches.",
        },
        {
            id: "cyber",
            title: "Cybersecurity",
            icon: "🛡️",
            ps: "Protecting systems, networks, and programs from digital attacks, ensuring data integrity and confidentiality.",
        },
        {
            id: "health",
            title: "Healthcare",
            icon: "🏥",
            ps: "Innovating medical technologies to improve patient care, diagnosis, and overall health outcomes.",
        },
        {
            id: "fintech",
            title: "Fintech",
            icon: "💰",
            ps: "Revolutionizing financial services through technology, making transactions faster, safer, and more accessible.",
        },
        {
            id: "iot",
            title: "IoT & Robotics",
            icon: "🔌",
            ps: "Connecting physical devices to the digital world and building autonomous systems for smarter living.",
        },
    ];

    return (
        <section id="domains" className="py-24 bg-[#050510] relative overflow-hidden">
            {/* Decorative gradient orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-white">
                    Battle Domains
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {domains.map((domain) => (
                        <div
                            key={domain.id}
                            className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all group overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-9xl">
                                {domain.icon}
                            </div>
                            <div className="relative z-10">
                                <div className="text-5xl mb-6">{domain.icon}</div>
                                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                                    {domain.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed mb-6 line-clamp-4 group-hover:line-clamp-none transition-all duration-300 text-sm">
                                    {domain.ps}
                                </p>
                                <div className="h-1 w-12 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
