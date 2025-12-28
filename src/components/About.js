export default function About() {
    const faculty = [
        { name: "Dr. Pavithra Sekar", role: "Faculty Coordinator" },
        { name: "Dr. Rama Parvathy", role: "Faculty Coordinator" }
    ];

    const studentCoordinators = [
        { name: "Sugeeth Jayaraj S.A.", role: "Student Coordinator", contact: "+91 81226 54796" },
        { name: "Prasanna M", role: "Student Coordinator (Help)", contact: "+91 97909 70726" }
    ];

    const teamLeads = [
        { name: "M. Shree", role: "Guests, Sponsorship & Awards" },
        { name: "Yashwant Gokul", role: "Technical Support" },
        { name: "L. Kevin Daniel", role: "Web Development" },
        { name: "Sanjay", role: "Security" },
        { name: "Jaidev Karthikeyan", role: "Reg & Marketing" },
        { name: "Suprajha V M", role: "Design & Social Media" },
        { name: "Sanjana", role: "Design & Social Media" }
    ];

    const devTeam = [
        { name: "Ibhan Mukherjee", role: "Frontend" },
        { name: "Devangshu Pandey", role: "Frontend" },
        { name: "Srijan Guchhait", role: "System Architect" }
    ];

    const TeamCard = ({ name, role, contact }) => (
        <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-xl hover:bg-white/10 transition-colors h-full flex flex-col justify-center text-center">
            <p className="font-bold text-white text-lg">{name}</p>
            <p className="text-sm text-secondary mt-1">{role}</p>
            {contact && <p className="text-xs text-gray-400 mt-1">{contact}</p>}
        </div>
    );

    return (
        <section id="about" className="py-24 bg-black relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    ⟨ THE ARCHITECTS ⟩
                </h2>

                {/* Faculty Coordinators */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-primary mb-8 text-center border-b border-primary/20 pb-2 w-fit block mx-auto px-10">
                        FACULTY COORDINATORS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {faculty.map((member, i) => (
                            <TeamCard key={i} {...member} />
                        ))}
                    </div>
                </div>

                {/* Student Coordinators */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-primary mb-8 text-center border-b border-primary/20 pb-2 w-fit block mx-auto px-10">
                        STUDENT COORDINATORS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {studentCoordinators.map((member, i) => (
                            <TeamCard key={i} {...member} />
                        ))}
                    </div>
                </div>

                {/* Team Leads */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-secondary mb-8 text-center border-b border-secondary/20 pb-2 w-fit block mx-auto px-10">
                        TEAM LEADS
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
                        {teamLeads.map((member, i) => (
                            <TeamCard key={i} {...member} />
                        ))}
                    </div>
                </div>

                {/* Dev Team */}
                <div>
                    <h3 className="text-2xl font-bold text-gray-400 mb-8 text-center text-sm tracking-widest border-b border-gray-500/20 pb-2 w-fit block mx-auto px-10">
                        DEV TEAM
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {devTeam.map((member, i) => (
                            <TeamCard key={i} {...member} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
