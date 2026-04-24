import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Settings2 } from "lucide-react"

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
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-slate-200">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Settings2 className="w-6 h-6 text-slate-700" />
          <CardTitle className="text-2xl font-bold">Final Configuration</CardTitle>
        </div>
        <CardDescription className="text-base">
          Set the creative parameters for the final script generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Tone</label>
          <Select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="Neutral">Neutral & Informative</option>
            <option value="Dramatic">Dramatic & Cinematic</option>
            <option value="Uplifting">Uplifting & Inspiring</option>
            <option value="Humorous">Humorous & Light</option>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Target Length</label>
          <Select value={length} onChange={(e) => setLength(e.target.value)}>
            <option value="1">1 Minute (Shorts/Reels)</option>
            <option value="3">3 Minutes (Bite-sized)</option>
            <option value="5">5 Minutes (Standard)</option>
            <option value="10">10 Minutes (Deep Dive)</option>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-4 border-t border-slate-100">
        <Button onClick={handleSubmit} size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
          Generate Script
        </Button>
      </CardFooter>
    </Card>
  )
}
