import { cn } from "@/lib/utils"
import { Check, AlertCircle } from "lucide-react"

export interface StepInfo {
  label: string
  isValid: boolean
  isVisited: boolean
}

interface StepperProps {
  steps: StepInfo[]
  currentStep: number
  onStepClick: (index: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav className="flex items-center justify-center gap-2 md:gap-4 py-4 px-2 overflow-x-auto">
      {steps.map((step, index) => {
        const isCurrent = index === currentStep
        const isCompleted = step.isVisited && step.isValid
        const hasError = step.isVisited && !step.isValid

        return (
          <div key={index} className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => onStepClick(index)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
                isCurrent && "bg-primary text-primary-foreground",
                !isCurrent && isCompleted && "bg-muted text-foreground hover:bg-accent",
                !isCurrent && hasError && "bg-destructive/10 text-destructive hover:bg-destructive/20",
                !isCurrent && !step.isVisited && "text-muted-foreground hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0",
                  isCurrent && "bg-primary-foreground text-primary",
                  !isCurrent && isCompleted && "bg-green-500 text-white",
                  !isCurrent && hasError && "bg-destructive text-white",
                  !isCurrent && !step.isVisited && "bg-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="w-3.5 h-3.5" />
                ) : hasError && !isCurrent ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-8 h-[2px]",
                isCompleted ? "bg-green-500" : "bg-border"
              )} />
            )}
          </div>
        )
      })}
    </nav>
  )
}
