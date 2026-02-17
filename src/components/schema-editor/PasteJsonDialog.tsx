import * as React from "react"
import type { Column } from "@/lib/schemas"
import { inferSchemaFromJson } from "@/lib/json-inferrer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PasteJsonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (columns: Column[]) => void
}

export function PasteJsonDialog({ open, onOpenChange, onApply }: PasteJsonDialogProps) {
  const [jsonInput, setJsonInput] = React.useState("")
  const [error, setError] = React.useState("")
  const [preview, setPreview] = React.useState<Column[] | null>(null)

  const handleParse = () => {
    setError("")
    setPreview(null)
    try {
      const parsed = JSON.parse(jsonInput)
      const columns = inferSchemaFromJson(parsed)
      if (columns.length === 0) {
        setError("No columns could be inferred from the JSON.")
        return
      }
      setPreview(columns)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  const handleApply = () => {
    if (preview) {
      onApply(preview)
      setJsonInput("")
      setPreview(null)
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    setJsonInput("")
    setError("")
    setPreview(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paste Sample Event</DialogTitle>
          <DialogDescription>
            Paste a sample JSON event from your application. Column names and types will be inferred automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder='{"severity": "high", "message": "Unauthorized access detected", "timestamp": "2024-01-15T10:30:00Z", "sourceIp": "10.0.0.1", "count": 42}'
            rows={8}
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            className="font-mono text-sm"
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {!preview && (
            <Button onClick={handleParse} disabled={!jsonInput.trim()}>
              Parse JSON
            </Button>
          )}

          {preview && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Inferred columns:</p>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Name</th>
                      <th className="text-left px-3 py-2 font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((col, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2 font-mono">{col.name}</td>
                        <td className="px-3 py-2">{col.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                TimeGenerated will be added automatically. You can adjust types after applying.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {preview && (
            <Button onClick={handleApply}>
              Apply {preview.length} columns
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
