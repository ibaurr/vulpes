"use client"

import { useState, useEffect } from "react"
import { getSavedScripts, deleteScript, clearAllScripts, type SavedScript } from "@/lib/script-history"
import { Button } from "@/components/ui/button"
import { Trash2, X, Clock, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ScriptHistoryDrawerProps {
  open: boolean
  onClose: () => void
  onLoad: (script: SavedScript) => void
}

export function ScriptHistoryDrawer({ open, onClose, onLoad }: ScriptHistoryDrawerProps) {
  const [scripts, setScripts] = useState<SavedScript[]>([])

  useEffect(() => {
    if (open) {
      setScripts(getSavedScripts())
    }
  }, [open])

  const handleDelete = (id: string) => {
    deleteScript(id)
    setScripts((prev) => prev.filter((s) => s.id !== id))
  }

  const handleClearAll = () => {
    clearAllScripts()
    setScripts([])
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(timestamp))
  }

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "…"
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-800">Script History</h2>
                {scripts.length > 0 && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {scripts.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {scripts.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs">
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {scripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <FileText className="w-10 h-10" />
                  <p className="text-sm">No saved scripts yet</p>
                  <p className="text-xs text-slate-300">Scripts are saved automatically after generation</p>
                </div>
              ) : (
                scripts.map((script) => (
                  <motion.div
                    key={script.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="group bg-slate-50 rounded-lg border border-slate-100 p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => {
                      onLoad(script)
                      onClose()
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-slate-800 truncate">
                          {script.topic}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDate(script.createdAt)} · v{script.version} · {script.tone}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          {truncate(script.script.replace(/[#*\[\]]/g, ""), 120)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(script.id)
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
