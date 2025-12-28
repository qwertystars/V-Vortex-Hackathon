export default function Sponsors() {
    return (
        <section id="sponsors" className="py-24 bg-black/50">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-16 text-white">Supported By</h2>

                <div className="flex flex-wrap justify-center gap-6 md:gap-16 items-center">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300">
                        <img src="/logo.jpg" alt="V-Vortex" className="h-20 md:h-24 w-auto object-contain" />
                    </div>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300">
                        <img src="/sponsors/vit-logo.png" alt="VIT Chennai" className="h-20 md:h-24 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                    </div>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300">
                        <img src="/sponsors/180degrees.png" alt="180 Degrees" className="h-20 md:h-24 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                    </div>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300">
                        <img src="/sponsors/shnorh.jpg" alt="Shnorh" className="h-16 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                    </div>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300">
                        <img src="/sponsors/bavesh.jpeg" alt="V-Nest" className="h-16 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>

                <div className="mt-20">
                    <h3 className="text-2xl font-bold text-gray-400 mb-8">Prize Pool Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                            <h4 className="text-2xl font-bold text-yellow-500">₹ 15,000</h4>
                            <p className="text-gray-400">Winner</p>
                        </div>
                        <div className="p-6 bg-gray-400/10 border border-gray-400/30 rounded-2xl">
                            <h4 className="text-2xl font-bold text-gray-300">₹ 7,000</h4>
                            <p className="text-gray-400">1st Runner Up</p>
                        </div>
                        <div className="p-6 bg-orange-700/10 border border-orange-700/30 rounded-2xl">
                            <h4 className="text-2xl font-bold text-orange-400">₹ 5,000</h4>
                            <p className="text-gray-400">2nd Runner Up</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
