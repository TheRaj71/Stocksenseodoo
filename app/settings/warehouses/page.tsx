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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Warehouse, MapPin, Package } from "lucide-react"
import { getWarehousesWithStats } from "@/app/actions/warehouses"
import Link from "next/link"

export default async function WarehousesPage() {
  const warehousesResult = await getWarehousesWithStats()
  const warehouses = warehousesResult.success ? warehousesResult.data : []

  // Calculate stats
  const totalWarehouses = warehouses?.length || 0
  const totalLocations = warehouses?.reduce((sum: number, wh: any) => sum + (wh.locationCount || 0), 0) || 0
  const activeWarehouses = warehouses?.filter((wh: any) => wh.active).length || 0

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
        <SiteHeader title="Warehouses" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalWarehouses}</div>
                <p className="text-xs text-muted-foreground">{activeWarehouses} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Locations</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLocations}</div>
                <p className="text-xs text-muted-foreground">Across all warehouses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Locations</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalWarehouses > 0 ? (totalLocations / totalWarehouses).toFixed(1) : 0}
                </div>
                <p className="text-xs text-muted-foreground">Per warehouse</p>
              </CardContent>
            </Card>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search warehouses..."
                  className="pl-10"
                />
              </div>
            </div>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Add Warehouse</span>
            </Button>
          </div>

          {/* Warehouses Table */}
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Code</TableHead>
                  <TableHead className="font-bold">Address</TableHead>
                  <TableHead className="font-bold">Locations</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses && warehouses.length > 0 ? (
                  warehouses.map((warehouse: any) => (
                    <TableRow key={warehouse.id}>
                      <TableCell className="font-semibold">{warehouse.name}</TableCell>
                      <TableCell className="font-mono">{warehouse.shortCode || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {warehouse.address || <span className="text-muted-foreground">No address</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {warehouse.locationCount || 0} locations
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={warehouse.active ? "default" : "secondary"}>
                          {warehouse.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <Warehouse className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-lg font-semibold">No warehouses yet</p>
                      <p className="text-sm text-muted-foreground">
                        Add your first warehouse to get started
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
