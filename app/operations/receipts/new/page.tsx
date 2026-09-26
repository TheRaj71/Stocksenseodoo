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
import { getSuppliers } from "@/app/actions/receipts"
import { getLocations } from "@/app/actions/locations"

export default async function NewReceiptPage() {
  const suppliersResult = await getSuppliers()
  const locationsResult = await getLocations()
  
  const suppliers = suppliersResult.success ? suppliersResult.data : []
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
        <SiteHeader title="New Receipt" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* Back Button */}
          <div>
            <Link href="/operations/receipts">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Receipts
              </Button>
            </Link>
          </div>

          {/* Form */}
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="text-2xl">Create New Receipt</CardTitle>
              <CardDescription>
                Create a receipt for incoming goods from suppliers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier *</Label>
                    <Select name="contactId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers && suppliers.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destLocation">Destination Location *</Label>
                    <Select name="destLocationId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduleDate">Scheduled Date *</Label>
                  <Input
                    id="scheduleDate"
                    name="scheduleDate"
                    type="date"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add purchase order number, delivery instructions, or other notes..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Create Receipt
                  </Button>
                  <Link href="/operations/receipts">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>

              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
                <p className="font-semibold mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Create the receipt in draft status</li>
                  <li>Add expected products and quantities</li>
                  <li>Set to "Waiting" when goods are expected</li>
                  <li>Validate to confirm receipt and update stock</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
