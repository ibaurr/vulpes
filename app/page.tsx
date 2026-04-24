"use client"

import { useState } from "react"
import { Wizard } from "@/components/script-engine/Wizard"
import { ScriptHistoryDrawer } from "@/components/script-engine/ScriptHistoryDrawer"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import type { SavedScript } from "@/lib/script-history"

export default function Home() {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [loadedScript, setLoadedScript] = useState<SavedScript | null>(null)

  const handleLoadScript = (script: SavedScript) => {
    setLoadedScript(script)
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 md:p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-slate-200/50 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-6xl w-full flex flex-col items-center">
        <header className="text-center mb-12 relative w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Vulpes: AI Video Script Engine
          </h1>
          {/* History button in the header */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              className="text-slate-500 gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
          </div>
        </header>

        <Wizard loadedScript={loadedScript} onScriptLoaded={() => setLoadedScript(null)} />
      </div>

      <ScriptHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onLoad={handleLoadScript}
      />
    </main>
  );
}
