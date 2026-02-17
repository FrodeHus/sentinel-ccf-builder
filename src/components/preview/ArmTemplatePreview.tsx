import * as React from "react"
import { useConnectorConfig } from "@/hooks/useConnectorConfig"
import { generateArmTemplate } from "@/lib/arm-generator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Download, Check } from "lucide-react"
import { downloadArmTemplate } from "@/lib/download"

export function ArmTemplatePreview() {
  const { config } = useConnectorConfig()
  const [copied, setCopied] = React.useState(false)
  const [template, setTemplate] = React.useState<string>("")

  React.useEffect(() => {
    try {
      const generated = generateArmTemplate(config)
      setTemplate(JSON.stringify(generated, null, 2))
    } catch (error) {
      setTemplate(`// Error generating template:\n// ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [config])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API might not be available
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">ARM Template Preview</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => downloadArmTemplate(config)}
              title="Download JSON"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 pb-6 px-6">
        <div className="h-full rounded-md border bg-muted/50 overflow-auto">
          <pre className="p-4 text-xs font-mono">
            <code>{template}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
