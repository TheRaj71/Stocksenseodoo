import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Package, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react"
import { getStockItems } from "@/app/actions/stock"
import Link from "next/link"

export default async function StockPage() {
  const stockResult = await getStockItems()
  const stockItems = stockResult.success ? stockResult.data : []

  // Calculate stats
  const totalItems = stockItems?.length || 0
  const lowStockItems = stockItems?.filter((item: any) => 
    item.Product?.minQuantity && item.quantity < item.Product.minQuantity
  ).length || 0
  const outOfStockItems = stockItems?.filter((item: any) => item.quantity === 0).length || 0
  const totalValue = stockItems?.reduce((sum: number, item: any) => 
    sum + (item.quantity * (item.Product?.unitPrice || 0)), 0
  ) || 0

  // Get stock by location for chart
  const stockByLocation = stockItems?.reduce((acc: any, item: any) => {
    const locationName = item.Location?.name || 'Unknown'
    if (!acc[locationName]) {
      acc[locationName] = { name: locationName, quantity: 0, value: 0 }
    }
    acc[locationName].quantity += item.quantity
    acc[locationName].value += item.quantity * (item.Product?.unitPrice || 0)
    return acc
  }, {})

  const locationData = Object.values(stockByLocation || {})

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
        <SiteHeader title="Stock Overview" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
                <p className="text-xs text-muted-foreground">
                  Across all locations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Current inventory value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
                <p className="text-xs text-muted-foreground">
                  Below minimum quantity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
                <p className="text-xs text-muted-foreground">
                  Needs replenishment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stock by Location Chart */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Stock by Location
                </CardTitle>
                <CardDescription>Quantity distribution across warehouses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(locationData as any[])?.map((location: any, idx: number) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-32 text-sm font-medium truncate">{location.name}</div>
                      <div className="flex-1 ml-4">
                        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 flex items-center justify-end px-2"
                            style={{
                              width: `${Math.min((location.quantity / Math.max(...(locationData as any[]).map((l: any) => l.quantity))) * 100, 100)}%`
                            }}
                          >
                            <span className="text-xs font-semibold text-white">{location.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!locationData || (locationData as any[]).length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No stock data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Stock Value by Location
                </CardTitle>
                <CardDescription>Value distribution in USD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(locationData as any[])?.map((location: any, idx: number) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-32 text-sm font-medium truncate">{location.name}</div>
                      <div className="flex-1 ml-4">
                        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 flex items-center justify-end px-2"
                            style={{
                              width: `${Math.min((location.value / Math.max(...(locationData as any[]).map((l: any) => l.value))) * 100, 100)}%`
                            }}
                          >
                            <span className="text-xs font-semibold text-white">${location.value.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!locationData || (locationData as any[]).length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No stock data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products in stock..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Stock Items Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Stock ({totalItems})</TabsTrigger>
              <TabsTrigger value="low">Low Stock ({lowStockItems})</TabsTrigger>
              <TabsTrigger value="out">Out of Stock ({outOfStockItems})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Product</TableHead>
                    <TableHead className="font-bold">SKU</TableHead>
                    <TableHead className="font-bold">Location</TableHead>
                    <TableHead className="font-bold">Quantity</TableHead>
                    <TableHead className="font-bold">Min Qty</TableHead>
                    <TableHead className="font-bold">Unit Price</TableHead>
                    <TableHead className="font-bold">Total Value</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems && stockItems.length > 0 ? (
                    stockItems.map((item: any) => {
                      const isLowStock = item.Product?.minQuantity && item.quantity < item.Product.minQuantity
                      const isOutOfStock = item.quantity === 0
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <Link href={`/products/${item.Product?.id}`} className="hover:underline">
                              {item.Product?.name}
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.Product?.sku}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{item.Location?.name}</div>
                              <div className="text-muted-foreground text-xs">
                                {item.Location?.Warehouse?.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{item.quantity}</TableCell>
                          <TableCell>{item.Product?.minQuantity || '-'}</TableCell>
                          <TableCell>${item.Product?.unitPrice?.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold">
                            ${(item.quantity * (item.Product?.unitPrice || 0)).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {isOutOfStock ? (
                              <Badge variant="destructive">Out of Stock</Badge>
                            ) : isLowStock ? (
                              <Badge className="bg-yellow-500">Low Stock</Badge>
                            ) : (
                              <Badge variant="default">In Stock</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-lg font-semibold">No stock items found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="low" className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Product</TableHead>
                    <TableHead className="font-bold">Location</TableHead>
                    <TableHead className="font-bold">Current</TableHead>
                    <TableHead className="font-bold">Minimum</TableHead>
                    <TableHead className="font-bold">Shortage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems?.filter((item: any) => 
                    item.Product?.minQuantity && item.quantity < item.Product.minQuantity && item.quantity > 0
                  ).map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.Product?.name}</TableCell>
                      <TableCell>{item.Location?.name}</TableCell>
                      <TableCell className="text-yellow-600 font-semibold">{item.quantity}</TableCell>
                      <TableCell>{item.Product?.minQuantity}</TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        -{item.Product.minQuantity - item.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="out" className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Product</TableHead>
                    <TableHead className="font-bold">Location</TableHead>
                    <TableHead className="font-bold">Minimum Required</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems?.filter((item: any) => item.quantity === 0).map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.Product?.name}</TableCell>
                      <TableCell>{item.Location?.name}</TableCell>
                      <TableCell>{item.Product?.minQuantity || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
