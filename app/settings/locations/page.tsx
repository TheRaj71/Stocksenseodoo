import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, MapPin } from "lucide-react"
import { getLocations } from "@/app/actions/locations"

export default async function LocationsPage() {
  const locationsResult = await getLocations()
  const locations = locationsResult.success ? locationsResult.data : []

  const totalLocations = locations?.length || 0
  const activeLocations = locations?.filter((loc: any) => loc.active).length || 0

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
        <SiteHeader title="Storage Locations" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLocations}</div>
                <p className="text-xs text-muted-foreground">{activeLocations} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Location Types</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(locations?.map((l: any) => l.type)).size || 0}
                </div>
                <p className="text-xs text-muted-foreground">Different types</p>
              </CardContent>
            </Card>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search locations..." className="pl-10" />
              </div>
            </div>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Add Location</span>
            </Button>
          </div>

          {/* Locations Table */}
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Type</TableHead>
                  <TableHead className="font-bold">Warehouse</TableHead>
                  <TableHead className="font-bold">Barcode</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations && locations.length > 0 ? (
                  locations.map((location: any) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-semibold">{location.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{location.type || 'INTERNAL'}</Badge>
                      </TableCell>
                      <TableCell>{location.Warehouse?.name || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{location.barcode || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={location.active ? "default" : "secondary"}>
                          {location.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-lg font-semibold">No locations yet</p>
                      <p className="text-sm text-muted-foreground">
                        Add storage locations within your warehouses
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
