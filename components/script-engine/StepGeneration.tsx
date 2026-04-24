import { useEffect, useRef } from "react"
import { useCompletion } from "@ai-sdk/react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Check, RefreshCcw } from "lucide-react"
import { useState } from "react"

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(completion)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-slate-200">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLoading && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
            <CardTitle className="text-xl font-bold">Generated Script: {topic}</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!completion}>
            {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-8 prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl min-h-[400px]">
          {completion ? (
            <ReactMarkdown>{completion}</ReactMarkdown>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-slate-400 flex-col gap-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>Writing your script based on verified facts...</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-slate-100 p-6 bg-slate-50/50 rounded-b-xl">
        <Button variant="ghost" onClick={onReset} className="text-slate-500">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Start Over
        </Button>
      </CardFooter>
    </Card>
  )
}
