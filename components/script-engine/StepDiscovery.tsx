import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface StepDiscoveryProps {
  onComplete: (topic: string) => void;
}

export function StepDiscovery({ onComplete }: StepDiscoveryProps) {
  const [topic, setTopic] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim()) {
      onComplete(topic.trim())
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-slate-200">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">What do you want to explore?</CardTitle>
          <CardDescription className="text-lg">
            Enter a topic, and our agent will research the web to ground the script in verified reality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <Input 
              placeholder="e.g. The life and death of Cleopatra" 
              className="text-lg py-6 px-4"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Button type="submit" size="lg" className="w-full text-lg h-12" disabled={!topic.trim()}>
              Start Agentic Research
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
