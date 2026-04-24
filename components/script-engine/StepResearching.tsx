import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, TerminalSquare } from "lucide-react"
import { experimental_useObject as useObject } from "@ai-sdk/react"
import { z } from "zod"
import { motion } from "framer-motion"

interface StepResearchingProps {
  topic: string;
  onComplete: (facts: string[]) => void;
}

const researchSchema = z.object({
  logs: z.array(z.string()),
  facts: z.array(z.string()),
});

export function StepResearching({ topic, onComplete }: StepResearchingProps) {
  const hasTriggered = useRef(false)
  const { object, submit, isLoading } = useObject({
    api: '/api/research',
    schema: researchSchema,
  });

  useEffect(() => {
    if (!hasTriggered.current) {
      hasTriggered.current = true;
      submit({ topic });
    }
  }, [submit, topic]);

  useEffect(() => {
    if (!isLoading && object?.facts && object.facts.length > 0) {
      // Small delay so the user can read the final thought
      const timer = setTimeout(() => {
        onComplete(object.facts as string[]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, object, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <Card className="w-full max-w-2xl mx-auto border-blue-200 shadow-lg">
        <CardHeader className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Researching the web...</CardTitle>
          <CardDescription>
            Gathering objective facts about &quot;{topic}&quot; to ground the AI generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-950 text-green-400 p-4 rounded-md font-mono text-sm min-h-[200px] shadow-inner relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3 text-slate-400 border-b border-slate-800 pb-2">
              <TerminalSquare className="w-4 h-4" />
              <span>Agentic Thought Stream</span>
            </div>
            
            <div className="space-y-2 flex flex-col justify-end">
              {!object?.logs || object.logs.length === 0 ? (
                <div className="animate-pulse">Initializing research agent...</div>
              ) : (
                object.logs.map((log, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 items-start"
                  >
                    <span className="text-slate-600 shrink-0">&gt;</span>
                    <span>{log}</span>
                  </motion.div>
                ))
              )}
              {isLoading && object?.logs && object.logs.length > 0 && (
                <div className="animate-pulse flex gap-2">
                  <span className="text-slate-600">&gt;</span>
                  <span className="w-2 h-4 bg-green-400 inline-block"></span>
                </div>
              )}
              {(!isLoading && object?.facts) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-blue-400 mt-4 pt-2 border-t border-slate-800"
                >
                  &gt; Research complete. Extracted {object.facts.length} facts. Proceeding to review...
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
