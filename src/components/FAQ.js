"use client";
import { useState } from "react";

export default function FAQ() {
    const faqs = [
        { q: "Who can participate?", a: "Students from any college or university can participate. Multi-college teams are also allowed!" },
        { q: "What is the team size?", a: "Teams can consist of 2 to 4 members." },
        { q: "Is there a registration fee?", a: "Yes, the registration fee is Rs. 200 per person." },
        { q: "Is the event online or offline?", a: "The Ideathon (Round 1) is online. The Hackathon (Round 2) and Grand Finale are offline at the venue." },
        { q: "Will food be provided?", a: "Yes, meals and refreshments will be provided during the offline hackathon." },
    ];

    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section id="faq" className="py-24 bg-[#050510] relative">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="max-w-3xl mx-auto px-6 relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-white">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full text-left px-8 py-6 flex justify-between items-center hover:bg-white/5 transition-colors focus:outline-none"
                            >
                                <span className="text-lg font-medium text-gray-200">{faq.q}</span>
                                <span className="text-2xl text-primary font-light">
                                    {openIndex === index ? "−" : "+"}
                                </span>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="px-8 pb-8 pt-2 text-gray-400 leading-relaxed">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
