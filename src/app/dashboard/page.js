export default function Dashboard() {
    return (
        <div className="min-h-screen pt-24 px-6 bg-background">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, Hacker 🚀</h1>
                        <p className="text-gray-400">Team: <span className="text-primary font-bold">NullPointers</span></p>
                    </div>
                    <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-yellow-500 font-bold text-sm">
                        Status: Action Required
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Status Card */}
                    <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-white mb-6">Application Status</h2>
                        <div className="relative pt-6 pb-2">
                            <div className="h-2 bg-gray-700 rounded-full mb-4 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-secondary w-1/3 rounded-full" />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 uppercase tracking-widest">
                                <span className="text-white font-bold">Registration</span>
                                <span>Team Formation</span>
                                <span>Idea Submission</span>
                            </div>
                        </div>
                        <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-xl flex gap-4 items-start">
                            <span className="text-2xl">ℹ️</span>
                            <div>
                                <h3 className="text-primary font-bold mb-1">Complete your Profile</h3>
                                <p className="text-gray-400 text-sm">You need to add 2 more members to finalize your team registration.</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
                        <div className="space-y-4">
                            <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                Edit Team
                            </button>
                            <button className="w-full py-3 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-colors">
                                View Rules
                            </button>
                            <button className="w-full py-3 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-colors">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-white mb-6">Announcements</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-center p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <span className="text-gray-500 text-sm w-24">Today</span>
                            <p className="text-gray-300">Hackathon venues have been finalized! Check the Timeline for details.</p>
                        </div>
                        <div className="flex gap-4 items-center p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <span className="text-gray-500 text-sm w-24">Yesterday</span>
                            <p className="text-gray-300">Problem statements for the &apos;Open Innovation&apos; track are now live.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
