import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Settings2 } from "lucide-react"
import { motion } from "framer-motion"

interface StepConfigProps {
  onComplete: (tone: string, length: string) => void;
}

export function StepConfig({ onComplete }: StepConfigProps) {
  const [tone, setTone] = useState("Neutral")
  const [length, setLength] = useState("3")

  const handleSubmit = () => {
    onComplete(tone, length)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <Card className="w-full max-w-xl mx-auto shadow-lg border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Settings2 className="w-6 h-6 text-black" />
            <CardTitle className="text-2xl font-bold">Script Configuration</CardTitle>
          </div>
          <CardDescription>
            Fine-tune the voice and pacing of the final video script.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900">Tone</label>
            <Select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="Neutral">Neutral</option>
              <option value="Dramatic">Dramatic</option>
              <option value="Uplifting">Uplifting</option>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900">Target Length</label>
            <Select value={length.toString()} onChange={(e) => setLength(e.target.value)}>
              <option value="1">1 Minute (Shorts/Reels)</option>
              <option value="3">3 Minutes (Bite-sized)</option>
              <option value="5">5 Minutes (Standard)</option>
              <option value="10">10 Minutes (Deep Dive)</option>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t border-slate-100">
          <Button onClick={handleSubmit} size="lg" className="w-full text-lg h-12">
            Generate Final Script
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
