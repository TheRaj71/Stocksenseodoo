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
import { getCustomers } from "@/app/actions/deliveries"
import { getLocations } from "@/app/actions/locations"

export default async function NewDeliveryPage() {
  const customersResult = await getCustomers()
  const locationsResult = await getLocations()
  
  const customers = customersResult.success ? customersResult.data : []
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
        <SiteHeader title="New Delivery" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* Back Button */}
          <div>
            <Link href="/operations/deliveries">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Deliveries
              </Button>
            </Link>
          </div>

          {/* Form */}
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="text-2xl">Create New Delivery Order</CardTitle>
              <CardDescription>
                Create a delivery order for outgoing shipments to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer *</Label>
                    <Select name="customerId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers && customers.map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sourceLocation">Source Location *</Label>
                    <Select name="sourceLocationId" required>
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
                    placeholder="Add any additional notes or instructions..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Create Delivery
                  </Button>
                  <Link href="/operations/deliveries">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>

              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
                <p className="font-semibold mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Create the delivery order in draft status</li>
                  <li>Add products to the delivery</li>
                  <li>Set to "Waiting" when ready to pick</li>
                  <li>Mark as "Ready" after picking</li>
                  <li>Validate to complete and update stock</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
