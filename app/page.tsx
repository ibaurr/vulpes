import { Wizard } from "@/components/script-engine/Wizard"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 md:p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-100/50 to-transparent -z-10 pointer-events-none" />
      
      <div className="max-w-6xl w-full flex flex-col items-center">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            The Orbital Script Engine
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A Research-First AI Video Script Generator. Grounded in reality, tailored for you.
          </p>
        </header>

        <Wizard />
      </div>
    </main>
  );
}
