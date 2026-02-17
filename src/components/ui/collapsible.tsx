import * as React from "react"
import { cn } from "@/lib/utils"

interface CollapsibleContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue>({ open: false, onOpenChange: () => {} })

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

function Collapsible({ open: controlledOpen, onOpenChange: controlledOnOpenChange, defaultOpen = false, className, ...props }: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = controlledOpen ?? internalOpen
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen

  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange }}>
      <div className={cn("", className)} {...props} />
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, onOpenChange } = React.useContext(CollapsibleContext)
  return (
    <button onClick={() => onOpenChange(!open)} {...props}>
      {children}
    </button>
  )
}

function CollapsibleContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = React.useContext(CollapsibleContext)
  if (!open) return null
  return <div className={cn("", className)} {...props}>{children}</div>
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
