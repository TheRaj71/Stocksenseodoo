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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, MoreVertical, TruckIcon, Package } from "lucide-react"
import Link from "next/link"
import { getDeliveries, getDeliveriesByStatus } from "@/app/actions/deliveries"
import { format } from "date-fns"

export default async function DeliveriesPage() {
  // Fetch deliveries by status
  const allDeliveriesResult = await getDeliveries()
  const draftDeliveriesResult = await getDeliveriesByStatus('DRAFT')
  const waitingDeliveriesResult = await getDeliveriesByStatus('WAITING')
  const readyDeliveriesResult = await getDeliveriesByStatus('READY')
  const doneDeliveriesResult = await getDeliveriesByStatus('DONE')
  
  const allDeliveries = allDeliveriesResult.success ? allDeliveriesResult.data : []
  const draftDeliveries = draftDeliveriesResult.success ? draftDeliveriesResult.data : []
  const waitingDeliveries = waitingDeliveriesResult.success ? waitingDeliveriesResult.data : []
  const readyDeliveries = readyDeliveriesResult.success ? readyDeliveriesResult.data : []
  const doneDeliveries = doneDeliveriesResult.success ? doneDeliveriesResult.data : []

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      DRAFT: { variant: "secondary", label: "Draft" },
      WAITING: { variant: "outline", label: "Waiting" },
      READY: { variant: "default", label: "Ready" },
      DONE: { variant: "default", label: "Done" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
    }
    const config = variants[status] || { variant: "secondary", label: status }
    return (
      <Badge variant={config.variant} className={
        status === 'WAITING' ? 'bg-yellow-500 text-white' :
        status === 'READY' ? 'bg-blue-500 text-white' :
        status === 'DONE' ? 'bg-green-500 text-white' : ''
      }>
        {config.label}
      </Badge>
    )
  }

  const renderDeliveriesTable = (deliveries: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold">Reference</TableHead>
          <TableHead className="font-bold">Customer</TableHead>
          <TableHead className="font-bold">Source Location</TableHead>
          <TableHead className="font-bold">Scheduled Date</TableHead>
          <TableHead className="font-bold">Status</TableHead>
          <TableHead className="font-bold">Items</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveries.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-lg font-semibold">No deliveries found</p>
              <p className="text-sm text-muted-foreground">
                Create your first delivery to get started
              </p>
            </TableCell>
          </TableRow>
        ) : (
          deliveries.map((delivery: any) => (
            <TableRow key={delivery.id}>
              <TableCell>
                <Link
                  href={`/operations/deliveries/${delivery.id}`}
                  className="font-mono font-semibold hover:underline"
                >
                  {delivery.reference}
                </Link>
              </TableCell>
              <TableCell className="font-medium">
                {delivery.Contact?.name || "N/A"}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{delivery.source_location?.name || "N/A"}</div>
                  <div className="text-muted-foreground text-xs">
                    {delivery.source_location?.Warehouse?.name || ""}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {delivery.scheduleDate ? 
                  format(new Date(delivery.scheduleDate), "MMM dd, yyyy") : 
                  "N/A"
                }
              </TableCell>
              <TableCell>{getStatusBadge(delivery.status)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {delivery.lines?.length || 0} items
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href={`/operations/deliveries/${delivery.id}`}>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                    </Link>
                    {delivery.status === 'DRAFT' && (
                      <Link href={`/operations/deliveries/${delivery.id}/edit`}>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                      </Link>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

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
        <SiteHeader title="Deliveries" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* Header Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search deliveries by reference or customer..."
                  className="pl-10"
                />
              </div>
            </div>
            <Link href="/operations/deliveries/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                <span className="font-semibold">New Delivery</span>
              </Button>
            </Link>
          </div>

          {/* Deliveries Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All ({allDeliveries?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Draft ({draftDeliveries?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="waiting">
                Waiting ({waitingDeliveries?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="ready">
                Ready ({readyDeliveries?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="done">
                Done ({doneDeliveries?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="rounded-lg border bg-card">
              {renderDeliveriesTable(allDeliveries || [])}
            </TabsContent>

            <TabsContent value="draft" className="rounded-lg border bg-card">
              {renderDeliveriesTable(draftDeliveries || [])}
            </TabsContent>

            <TabsContent value="waiting" className="rounded-lg border bg-card">
              {renderDeliveriesTable(waitingDeliveries || [])}
            </TabsContent>

            <TabsContent value="ready" className="rounded-lg border bg-card">
              {renderDeliveriesTable(readyDeliveries || [])}
            </TabsContent>

            <TabsContent value="done" className="rounded-lg border bg-card">
              {renderDeliveriesTable(doneDeliveries || [])}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
