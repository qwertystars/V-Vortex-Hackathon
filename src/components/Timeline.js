"use client";
import { useState } from "react";

export default function Timeline() {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const events = [
        {
            date: "Jan 07 - 08, 2026",
            title: "ROUND 1: CONCEPTUALIZATION",
            desc: "The Ideathon will be conducted by the V-Vortex team via a dedicated platform. The problem statements will be displayed on January 7, 2026.",
            details: [
                "Rules: 10–15 slides maximum, Clear problem & solution, Market & feasibility analysis.",
                "Evaluation: Innovation (30%), Feasibility (25%), Market Impact (25%), Presentation (20%)",
                "Mode: Online"
            ]
        },
        {
            date: "Jan 09 - 10, 2026",
            title: "ROUND 2: CONSTRUCTION",
            desc: "The hackathon will commence offline at VIT Chennai on January 9, 2025 from 9 AM onwards. Participants are requested to report to MG Auditorium before 8:30 AM.",
            details: [
                "Rules: No pre-written code, Any tech stack allowed, Mentors available.",
                "Evaluation: Working Prototype (35%), Code Quality (25%), UX/UI (20%)"
            ]
        },
        {
            date: "Jan 10, 2026",
            title: "ROUND 3: VALIDATION",
            desc: "The finalists will be selected for a exclusive investor pitch with the director of V-Nest and a team of industry domain experts.",
            details: [
                "Pitch: 10 min pitch + Q&A, Selected teams pitch to Industry Entrepreneurs.",
                "Rewards: ₹ 15,000 Winner, ₹ 7,000 First Runner-Up, ₹ 5,000 Second Runner-Up."
            ]
        },
    ];

    return (
        <section id="timeline" className="py-24 bg-[#050510]">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-white">PATH TO VICTORY</h2>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary via-secondary to-purple-800 rounded-full opacity-30 md:block hidden" />

                    <div className="space-y-6 md:space-y-12">
                        {events.map((event, index) => (
                            <div key={index} className={`flex flex-col md:flex-row items-center justify-between w-full ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>

                                {/* Empty space for alternate side */}
                                <div className="w-5/12 hidden md:block" />

                                {/* Dot */}
                                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10 hidden md:block border-4 border-black" />

                                {/* Content Card */}
                                <div
                                    onClick={() => toggleExpand(index)}
                                    className="w-full md:w-5/12 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-bold text-primary tracking-widest uppercase block group-hover:text-secondary transition-colors">{event.date}</span>
                                        <span className="text-gray-500 text-xs bg-white/5 px-2 py-1 rounded-full border border-white/10 group-hover:border-primary/30 transition-colors">
                                            {expandedIndex === index ? "collapse" : "view details"}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-3">{event.desc}</p>

                                    <div className={`overflow-hidden transition-all duration-300 ${expandedIndex === index ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                        {event.details && (
                                            <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside border-t border-white/10 pt-4 bg-black/20 p-3 rounded-lg">
                                                {event.details.map((detail, i) => (
                                                    <li key={i}>{detail}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
