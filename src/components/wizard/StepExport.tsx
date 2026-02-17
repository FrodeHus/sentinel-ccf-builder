import * as React from "react"
import { useConnectorConfig } from "@/hooks/useConnectorConfig"
import { downloadArmTemplate, downloadSolutionZip, downloadIndividualFile } from "@/lib/download"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Download, FileJson, FolderArchive, ChevronDown, HelpCircle } from "lucide-react"

export function StepExport() {
  const { config, updateSolution } = useConnectorConfig()
  const { solution } = config
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Solution Metadata</CardTitle>
          <CardDescription>
            Finalize packaging metadata for Sentinel Content Hub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publisherId">Publisher ID *</Label>
              <Input
                id="publisherId"
                placeholder="contoso"
                value={solution.publisherId}
                onChange={e => updateSolution({ publisherId: e.target.value.toLowerCase() })}
              />
              <p className="text-xs text-muted-foreground">
                Lowercase, no spaces. Used in Content Hub.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offerId">Offer ID *</Label>
              <Input
                id="offerId"
                placeholder="contoso-security-alerts"
                value={solution.offerId}
                onChange={e => updateSolution({ offerId: e.target.value.toLowerCase() })}
              />
              <p className="text-xs text-muted-foreground">
                Lowercase with hyphens. Globally unique.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                placeholder="1.0.0"
                value={solution.version}
                onChange={e => updateSolution({ version: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportTier">Support Tier *</Label>
              <select
                id="supportTier"
                value={solution.support.tier}
                onChange={e => updateSolution({
                  support: { ...solution.support, tier: e.target.value as "Microsoft" | "Partner" | "Community" }
                })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Microsoft">Microsoft</option>
                <option value="Partner">Partner</option>
                <option value="Community">Community</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportName">Support Name *</Label>
            <Input
              id="supportName"
              placeholder="Contoso Support"
              value={solution.support.name}
              onChange={e => updateSolution({
                support: { ...solution.support, name: e.target.value }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportLink">Support Link *</Label>
            <Input
              id="supportLink"
              placeholder="https://support.contoso.com"
              value={solution.support.link}
              onChange={e => updateSolution({
                support: { ...solution.support, link: e.target.value }
              })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Download</CardTitle>
          <CardDescription>
            Export your connector as an ARM template ready for deployment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => downloadArmTemplate(config)}
            className="w-full justify-start"
            size="lg"
          >
            <FileJson className="w-5 h-5 mr-2" />
            Download ARM Template
          </Button>
          <p className="text-xs text-muted-foreground">
            Single JSON file ready for Azure Portal, CLI, or PowerShell deployment.
          </p>

          <Button
            onClick={() => downloadSolutionZip(config)}
            variant="outline"
            className="w-full justify-start"
            size="lg"
          >
            <FolderArchive className="w-5 h-5 mr-2" />
            Download Solution Package (ZIP)
          </Button>
          <p className="text-xs text-muted-foreground">
            Full folder structure for Azure-Sentinel packaging tool.
          </p>

          <Collapsible open={expanded} onOpenChange={setExpanded}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 cursor-pointer">
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
              Download individual files
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => downloadIndividualFile("table", config)}
                >
                  <Download className="w-3.5 h-3.5 mr-2" />
                  table.json
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => downloadIndividualFile("dcr", config)}
                >
                  <Download className="w-3.5 h-3.5 mr-2" />
                  DCR.json
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => downloadIndividualFile("connectorDef", config)}
                >
                  <Download className="w-3.5 h-3.5 mr-2" />
                  connectorDefinition.json
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => downloadIndividualFile("dataConnector", config)}
                >
                  <Download className="w-3.5 h-3.5 mr-2" />
                  dataConnector.json
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-medium text-foreground mb-2">Deploy via Azure Portal</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Navigate to <a href="https://portal.azure.com/#create/Microsoft.Template" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Deploy a custom template</a></li>
              <li>Click &quot;Build your own template in the editor&quot;</li>
              <li>Upload mainTemplate.json</li>
              <li>Select your subscription, resource group, and workspace</li>
              <li>Review and create</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">Deploy via Azure CLI</h4>
            <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto">
              {`az deployment group create \\
  --resource-group <your-resource-group> \\
  --template-file mainTemplate.json \\
  --parameters workspace=<workspace-name> workspace-location=<location>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">After Deployment</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Find your connector in Sentinel Data Connectors gallery</li>
              <li>Click &quot;Deploy&quot; button to provision the push endpoint</li>
              <li>Copy the connection credentials from the connector page</li>
              <li>Configure your application to send data to the ingestion endpoint</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <HelpCircle className="w-4 h-4" />
          What is this step about?
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardContent className="pt-4 text-sm text-muted-foreground space-y-2">
              <p>This final step packages your connector for deployment to Azure.</p>
              <p>The <strong>ARM template</strong> contains all resources needed to deploy your connector to Sentinel.</p>
              <p>The <strong>solution package</strong> is the full folder structure used by Microsoft&apos;s packaging tools for Content Hub distribution.</p>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
