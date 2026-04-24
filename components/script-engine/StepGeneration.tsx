import { useEffect, useRef, useState } from "react"
import { useCompletion } from "@ai-sdk/react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Check, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"

interface StepGenerationProps {
  topic: string;
  facts: string[];
  notes: string;
  tone: string;
  length: string;
  onReset: () => void;
}

export function StepGeneration({ topic, facts, notes, tone, length, onReset }: StepGenerationProps) {
  const { completion, isLoading, complete } = useCompletion({
    api: "/api/generate",
    streamProtocol: "text",
  })
  
  const [copied, setCopied] = useState(false)
  const hasTriggered = useRef(false)

  useEffect(() => {
    if (!hasTriggered.current) {
      hasTriggered.current = true;
      complete("", {
        body: { topic, facts, notes, tone, length }
      })
    }
  }, [complete, topic, facts, notes, tone, length])

  const handleCopy = () => {
    navigator.clipboard.writeText(completion)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <Card className="w-full max-w-4xl mx-auto shadow-2xl border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-800">
            Generated Script: {topic}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!completion}>
              {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-slate-50 p-6 sm:p-8 min-h-[400px] max-h-[60vh] overflow-y-auto prose prose-slate max-w-none">
            {completion ? (
              <ReactMarkdown>{completion}</ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 pt-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p>Writing your script based on verified facts...</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-4 pb-4 px-6 border-t border-slate-100 flex justify-between bg-white rounded-b-xl">
          <Button variant="ghost" onClick={onReset} className="text-slate-500">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
          {isLoading && (
            <div className="flex items-center text-sm text-blue-600 font-medium animate-pulse">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-ping" />
              Generating...
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
