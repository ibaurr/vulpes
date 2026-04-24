"use client"

import { useState } from "react"
import { StepDiscovery } from "./StepDiscovery"
import { StepResearching } from "./StepResearching"
import { StepReview } from "./StepReview"
import { StepConfig } from "./StepConfig"
import { StepGeneration } from "./StepGeneration"
import { AnimatePresence } from "framer-motion"

type Step = "discovery" | "researching" | "review" | "config" | "generation"

export function Wizard() {
  const [currentStep, setCurrentStep] = useState<Step>("discovery")
  
  // State for the wizard data
  const [topic, setTopic] = useState("")
  const [facts, setFacts] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [tone, setTone] = useState("Neutral")
  const [length, setLength] = useState("3")

  const handleDiscoveryComplete = (selectedTopic: string) => {
    setTopic(selectedTopic)
    setCurrentStep("researching")
  }

  const handleResearchComplete = (gatheredFacts: string[]) => {
    setFacts(gatheredFacts)
    setCurrentStep("review")
  }

  const handleReviewComplete = (approvedFacts: string[], customNotes: string) => {
    setFacts(approvedFacts)
    setNotes(customNotes)
    setCurrentStep("config")
  }

  const handleConfigComplete = (selectedTone: string, selectedLength: string) => {
    setTone(selectedTone)
    setLength(selectedLength)
    setCurrentStep("generation")
  }

  const handleReset = () => {
    setTopic("")
    setFacts([])
    setNotes("")
    setTone("Neutral")
    setLength("3")
    setCurrentStep("discovery")
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {currentStep === "discovery" && (
          <StepDiscovery key="discovery" onComplete={handleDiscoveryComplete} />
        )}
        {currentStep === "researching" && (
          <StepResearching key="researching" topic={topic} onComplete={handleResearchComplete} />
        )}
        {currentStep === "review" && (
          <StepReview key="review" facts={facts} onComplete={handleReviewComplete} />
        )}
        {currentStep === "config" && (
          <StepConfig key="config" onComplete={handleConfigComplete} />
        )}
        {currentStep === "generation" && (
          <StepGeneration 
            key="generation"
            topic={topic}
            facts={facts}
            notes={notes}
            tone={tone}
            length={length}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
