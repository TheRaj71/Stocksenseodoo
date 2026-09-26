import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { getLocations } from "@/app/actions/locations"

export default async function NewAdjustmentPage() {
  const locationsResult = await getLocations()
  const locations = locationsResult.success ? locationsResult.data : []

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="New Stock Adjustment" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* Back Button */}
          <div>
            <Link href="/operations/adjustments">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Adjustments
              </Button>
            </Link>
          </div>

          {/* Form */}
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="text-2xl">Create Stock Adjustment</CardTitle>
              <CardDescription>
                Adjust inventory quantities for corrections, damages, or initial stock
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select name="destLocationId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location to adjust" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations && locations.map((location: any) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} - {location.Warehouse?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adjustmentType">Adjustment Type</Label>
                  <Select name="adjustmentType">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="correction">Inventory Correction</SelectItem>
                      <SelectItem value="damage">Damaged Goods</SelectItem>
                      <SelectItem value="loss">Loss/Shrinkage</SelectItem>
                      <SelectItem value="initial">Initial Stock</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Reason / Notes *</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Explain the reason for this adjustment..."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Create Adjustment
                  </Button>
                  <Link href="/operations/adjustments">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>

              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                <p className="font-semibold mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Stock adjustments directly modify inventory quantities</li>
                  <li>Always provide a clear reason for the adjustment</li>
                  <li>After creating, add products with their new quantities</li>
                  <li>Validate to apply changes to stock levels</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
