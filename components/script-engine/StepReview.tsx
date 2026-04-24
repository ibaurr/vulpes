import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

interface StepReviewProps {
  facts: string[];
  onComplete: (approvedFacts: string[], notes: string) => void;
}

export function StepReview({ facts, onComplete }: StepReviewProps) {
  const [selectedFacts, setSelectedFacts] = useState<Set<number>>(new Set(facts.map((_, i) => i)))
  const [notes, setNotes] = useState("")

  const toggleFact = (index: number) => {
    const newSelected = new Set(selectedFacts)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedFacts(newSelected)
  }

  const handleApprove = () => {
    const approved = facts.filter((_, i) => selectedFacts.has(i))
    onComplete(approved, notes)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <Card className="w-full max-w-3xl mx-auto shadow-lg border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <CardTitle className="text-2xl font-bold">Fact Review</CardTitle>
          </div>
          <CardDescription className="text-base">
            Review the research findings. Uncheck any facts you believe are incorrect or irrelevant to prevent hallucinations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="font-semibold text-slate-700 mb-2">Verified Contextual Grounding</h4>
            {facts.map((fact, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Checkbox 
                  id={`fact-${index}`} 
                  checked={selectedFacts.has(index)}
                  onChange={() => toggleFact(index)}
                  className="mt-1"
                />
                <label 
                  htmlFor={`fact-${index}`} 
                  className={`text-sm leading-relaxed cursor-pointer ${!selectedFacts.has(index) ? 'text-slate-400 line-through' : 'text-slate-900'}`}
                >
                  {fact}
                </label>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Add Custom Notes (Optional)</label>
            <Textarea 
              placeholder="Add specific angles, emphasis, or additional facts you want included..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-4 border-t border-slate-100">
          <Button onClick={handleApprove} size="lg" className="w-full sm:w-auto">
            Approve & Continue
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
