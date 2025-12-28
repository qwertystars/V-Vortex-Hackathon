import Hero from "@/components/Hero";
import About from "@/components/About";
import Timeline from "@/components/Timeline";
import Domains from "@/components/Domains";
import Sponsors from "@/components/Sponsors";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />
      <About />
      <Timeline />
      <Domains />
      <Sponsors />
      <FAQ />
    </main>
  );
}
