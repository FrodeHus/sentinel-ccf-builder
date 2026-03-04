import * as React from "react"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import { useTutorial } from "@/hooks/useTutorial"
import { TutorialPickerDialog } from "./TutorialPickerDialog"
import type { TourId } from "@/lib/tutorial/types"

interface TutorialButtonProps {
  onSelect: (tourId: TourId) => void
}

export function TutorialButton({ onSelect }: TutorialButtonProps) {
  const { isRunning } = useTutorial()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDialogOpen(true)}
        title="Interactive Tutorial"
        disabled={isRunning}
      >
        <GraduationCap className="w-4 h-4" />
      </Button>
      <TutorialPickerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={onSelect}
      />
    </>
  )
}
