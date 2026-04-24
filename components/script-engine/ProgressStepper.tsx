"use client"

import { motion } from "framer-motion"
import { Search, FlaskConical, CheckCircle2, Settings2, FileText, Check } from "lucide-react"

type Step = "discovery" | "researching" | "review" | "config" | "generation"

interface ProgressStepperProps {
  currentStep: Step
}

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "discovery", label: "Discovery", icon: Search },
  { key: "researching", label: "Research", icon: FlaskConical },
  { key: "review", label: "Review", icon: CheckCircle2 },
  { key: "config", label: "Config", icon: Settings2 },
  { key: "generation", label: "Script", icon: FileText },
]

const STEP_ORDER: Step[] = STEPS.map((s) => s.key)

function getStepIndex(step: Step) {
  return STEP_ORDER.indexOf(step)
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const currentIndex = getStepIndex(currentStep)

  return (
    <nav aria-label="Progress" className="w-full max-w-2xl mx-auto mb-10">
      <ol className="flex items-center justify-between relative">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isFuture = index > currentIndex
          const Icon = step.icon

          return (
            <li
              key={step.key}
              className="flex flex-col items-center relative z-10"
              style={{ flex: index === STEPS.length - 1 ? "0 0 auto" : "1 1 0%" }}
            >
              <div className="flex items-center w-full">
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {/* Completed state */}
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-md shadow-slate-200"
                      >
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </motion.div>
                    )}

                    {/* Current state */}
                    {isCurrent && (
                      <div className="relative">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg shadow-slate-300"
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </motion.div>
                        {/* Pulse ring */}
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-slate-400"
                          animate={{ scale: [1, 1.4, 1.4], opacity: [0.6, 0, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        />
                      </div>
                    )}

                    {/* Future state */}
                    {isFuture && (
                      <div className="w-10 h-10 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center">
                        <Icon className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`mt-2 text-xs font-medium hidden sm:block transition-colors duration-300 ${
                      isCompleted
                        ? "text-black"
                        : isCurrent
                          ? "text-black font-semibold"
                          : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div className="flex-1 mx-2 sm:mx-3 h-0.5 bg-slate-200 rounded-full relative self-start mt-5">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-black rounded-full"
                      initial={{ width: "0%" }}
                      animate={{
                        width: isCompleted ? "100%" : isCurrent ? "0%" : "0%",
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
