import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useCompletion } from "@ai-sdk/react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Check, RotateCcw, SendHorizonal, Sparkles, History, Download, FileText, FileDown, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { saveScript } from "@/lib/script-history"
import { computeWordStats } from "@/lib/word-stats"

interface StepGenerationProps {
  topic: string;
  facts: string[];
  notes: string;
  tone: string;
  length: string;
  onReset: () => void;
  preloadedScript?: string | null;
}

interface Revision {
  instruction: string;
  version: number;
}

export function StepGeneration({ topic, facts, notes, tone, length, onReset, preloadedScript }: StepGenerationProps) {
  // --- Initial generation ---
  const { completion: initialCompletion, isLoading: isGenerating, complete } = useCompletion({
    api: "/api/generate",
    streamProtocol: "text",
  })

  // --- Revision ---
  const { completion: revisionCompletion, isLoading: isRevising, complete: completeRevision } = useCompletion({
    api: "/api/revise",
    streamProtocol: "text",
  })

  const [currentScript, setCurrentScript] = useState(preloadedScript || "")
  const [revisionHistory, setRevisionHistory] = useState<Revision[]>([])
  const [revisionInput, setRevisionInput] = useState("")
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [saved, setSaved] = useState(false)

  const hasTriggered = useRef(false)
  const hasSaved = useRef(!!preloadedScript) // don't re-save loaded scripts
  const inputRef = useRef<HTMLInputElement>(null)
  const scriptEndRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  // Trigger initial generation (skip if preloaded)
  useEffect(() => {
    if (!hasTriggered.current && !preloadedScript) {
      hasTriggered.current = true;
      complete("", {
        body: { topic, facts, notes, tone, length }
      })
    }
  }, [complete, topic, facts, notes, tone, length, preloadedScript])

  // Capture finalized initial script
  useEffect(() => {
    if (!isGenerating && initialCompletion && !currentScript) {
      setCurrentScript(initialCompletion)
    }
  }, [isGenerating, initialCompletion, currentScript])

  // Capture finalized revision script
  useEffect(() => {
    if (!isRevising && revisionCompletion && revisionHistory.length > 0) {
      setCurrentScript(revisionCompletion)
    }
  }, [isRevising, revisionCompletion, revisionHistory.length])

  // Auto-save script after initial generation completes
  useEffect(() => {
    if (!isGenerating && currentScript && !hasSaved.current) {
      hasSaved.current = true
      saveScript({
        topic,
        script: currentScript,
        tone,
        length,
        version: 1,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }, [isGenerating, currentScript, topic, tone, length])

  // Auto-save after revision completes
  useEffect(() => {
    if (!isRevising && revisionCompletion && revisionHistory.length > 0) {
      saveScript({
        topic,
        script: revisionCompletion,
        tone,
        length,
        version: revisionHistory.length + 1,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }, [isRevising, revisionCompletion, revisionHistory.length, topic, tone, length])

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false)
      }
    }
    if (showExport) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showExport])

  // The text to display — prefer streaming content when active
  const displayText = isRevising
    ? revisionCompletion || currentScript
    : isGenerating
      ? initialCompletion
      : currentScript

  const isStreaming = isGenerating || isRevising
  const generationDone = !isGenerating && !!currentScript

  // Word count & read time
  const stats = useMemo(() => computeWordStats(displayText), [displayText])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(currentScript || initialCompletion)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [currentScript, initialCompletion])

  const handleRevisionSubmit = useCallback(() => {
    const instruction = revisionInput.trim()
    if (!instruction || isStreaming) return

    const nextVersion = revisionHistory.length + 2 // v1 is original
    setRevisionHistory((prev) => [...prev, { instruction, version: nextVersion }])
    setRevisionInput("")

    completeRevision("", {
      body: {
        topic,
        currentScript,
        instruction,
        facts,
        tone,
        length,
      },
    })
  }, [revisionInput, isStreaming, revisionHistory.length, completeRevision, topic, currentScript, facts, tone, length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleRevisionSubmit()
    }
  }

  // --- Export handlers ---
  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowExport(false)
  }, [])

  const handleExportMarkdown = useCallback(() => {
    const filename = `${topic.toLowerCase().replace(/\s+/g, "-")}-script.md`
    downloadFile(currentScript || initialCompletion, filename, "text/markdown")
  }, [currentScript, initialCompletion, topic, downloadFile])

  const handleExportText = useCallback(() => {
    // Strip markdown formatting for plain text
    const plain = (currentScript || initialCompletion)
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    const filename = `${topic.toLowerCase().replace(/\s+/g, "-")}-script.txt`
    downloadFile(plain, filename, "text/plain")
  }, [currentScript, initialCompletion, topic, downloadFile])

  const currentVersion = revisionHistory.length > 0 ? revisionHistory.length + 1 : 1

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full"
    >
      <Card className="w-full max-w-5xl mx-auto shadow-2xl border-slate-200 bg-white overflow-hidden">
        {/* Header */}
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CardTitle className="text-xl font-bold text-slate-800 truncate">
                {topic}
              </CardTitle>
              {/* Version badge */}
              <motion.span
                key={currentVersion}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-black border border-slate-200 shrink-0"
              >
                v{currentVersion}
              </motion.span>
            </div>
            <div className="flex gap-2 shrink-0">
              {/* Auto-save indicator */}
              <AnimatePresence>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium self-center"
                  >
                    <Check className="w-3 h-3" /> Saved
                  </motion.span>
                )}
              </AnimatePresence>
              {revisionHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-slate-500"
                >
                  <History className="w-4 h-4 mr-1.5" />
                  History
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleCopy} disabled={!displayText}>
                {copied ? <Check className="w-4 h-4 mr-1.5 text-green-500" /> : <Copy className="w-4 h-4 mr-1.5" />}
                Copy
              </Button>
              {/* Export dropdown */}
              <div className="relative" ref={exportRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExport(!showExport)}
                  disabled={!displayText}
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Export
                </Button>
                <AnimatePresence>
                  {showExport && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-20 overflow-hidden"
                    >
                      <button
                        onClick={handleExportMarkdown}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                      >
                        <FileText className="w-4 h-4 text-slate-400" />
                        Markdown (.md)
                      </button>
                      <button
                        onClick={handleExportText}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left border-t border-slate-100"
                      >
                        <FileDown className="w-4 h-4 text-slate-400" />
                        Plain Text (.txt)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Revision history panel */}
        <AnimatePresence>
          {showHistory && revisionHistory.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-b border-slate-100"
            >
              <div className="px-6 py-4 bg-slate-50/80 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Revision History
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-600 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    v1 — Original
                  </span>
                  {revisionHistory.map((rev) => (
                    <motion.span
                      key={rev.version}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-black shadow-sm max-w-[200px]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-black" />
                      <span className="truncate">v{rev.version} — {rev.instruction}</span>
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Script content */}
        <CardContent className="p-0">
          <div className="bg-slate-50 p-6 sm:p-8 min-h-[400px] max-h-[55vh] overflow-y-auto prose prose-slate max-w-none">
            {displayText ? (
              <>
                <ReactMarkdown>{displayText}</ReactMarkdown>
                <div ref={scriptEndRef} />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 pt-20">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
                <p>Writing your script based on verified facts...</p>
              </div>
            )}
          </div>
        </CardContent>

        {/* Word count & read time bar */}
        <AnimatePresence>
          {displayText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6 py-2 border-t border-slate-100 bg-white flex items-center gap-4"
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <FileText className="w-3.5 h-3.5" />
                <span>{stats.words.toLocaleString()} words</span>
              </div>
              <div className="w-px h-3 bg-slate-200" />
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{stats.readTime} narration</span>
              </div>
              {isStreaming && (
                <>
                  <div className="w-px h-3 bg-slate-200" />
                  <span className="text-xs text-slate-300 italic">counting...</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Revision input — appears after initial generation completes */}
        <AnimatePresence>
          {generationDone && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 py-4 border-t border-slate-100 bg-gradient-to-t from-slate-50/80 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-black" />
                  <span className="text-sm font-semibold text-slate-700">
                    Revise your script
                  </span>
                  <span className="text-xs text-slate-400 ml-1">— tell the AI what to change</span>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={revisionInput}
                    onChange={(e) => setRevisionInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Make the intro more suspenseful..."
                    disabled={isStreaming}
                    className="flex-1 h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
                  />
                  <Button
                    onClick={handleRevisionSubmit}
                    disabled={!revisionInput.trim() || isStreaming}
                    size="icon"
                    className="h-11 w-11 shrink-0"
                  >
                    {isRevising ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <SendHorizonal className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <CardFooter className="pt-4 pb-4 px-6 border-t border-slate-100 flex justify-between bg-white rounded-b-xl">
          <Button variant="ghost" onClick={onReset} className="text-slate-500">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center text-sm text-black font-medium"
            >
              <motion.div
                className="w-2 h-2 bg-black rounded-full mr-2"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              {isRevising ? "Applying revision..." : "Generating..."}
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
