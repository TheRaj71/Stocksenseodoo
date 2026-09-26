import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  TruckIcon, 
  ArrowRightLeft, 
  Settings, 
  FileText, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { getDeliveriesByStatus } from "@/app/actions/deliveries"
import { getReceiptsByStatus } from "@/app/actions/receipts"

export default async function OperationsPage() {
  // Fetch operation counts
  const waitingDeliveriesResult = await getDeliveriesByStatus('WAITING')
  const readyDeliveriesResult = await getDeliveriesByStatus('READY')
  const draftDeliveriesResult = await getDeliveriesByStatus('DRAFT')
  
  const waitingReceiptsResult = await getReceiptsByStatus('WAITING')
  const draftReceiptsResult = await getReceiptsByStatus('DRAFT')

  const waitingDeliveries = waitingDeliveriesResult.success ? waitingDeliveriesResult.data?.length || 0 : 0
  const readyDeliveries = readyDeliveriesResult.success ? readyDeliveriesResult.data?.length || 0 : 0
  const draftDeliveries = draftDeliveriesResult.success ? draftDeliveriesResult.data?.length || 0 : 0
  
  const waitingReceipts = waitingReceiptsResult.success ? waitingReceiptsResult.data?.length || 0 : 0
  const draftReceipts = draftReceiptsResult.success ? draftReceiptsResult.data?.length || 0 : 0

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
        <SiteHeader title="Operations" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* Overview Section */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Warehouse Operations</h2>
            <p className="text-muted-foreground text-lg">
              Manage receipts, deliveries, transfers, and stock adjustments
            </p>
          </div>

          {/* Main Operation Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Receipts */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-500/10 p-3">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Receipts</CardTitle>
                      <CardDescription>Incoming goods</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Waiting</p>
                    <p className="text-2xl font-bold text-yellow-600">{waitingReceipts}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Draft</p>
                    <p className="text-2xl font-bold text-gray-500">{draftReceipts}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/operations/receipts" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </Link>
                  <Link href="/operations/receipts/new">
                    <Button>
                      New Receipt
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Deliveries */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/10 p-3">
                      <TruckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Deliveries</CardTitle>
                      <CardDescription>Outgoing shipments</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Waiting</p>
                    <p className="text-xl font-bold text-yellow-600">{waitingDeliveries}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Ready</p>
                    <p className="text-xl font-bold text-blue-600">{readyDeliveries}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Draft</p>
                    <p className="text-xl font-bold text-gray-500">{draftDeliveries}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/operations/deliveries" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </Link>
                  <Link href="/operations/deliveries/new">
                    <Button>
                      New Delivery
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Internal Transfers */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-purple-500/10 p-3">
                      <ArrowRightLeft className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Transfers</CardTitle>
                      <CardDescription>Internal movements</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">0</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Draft</p>
                    <p className="text-2xl font-bold text-gray-500">0</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/operations/transfers" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </Link>
                  <Link href="/operations/transfers/new">
                    <Button>
                      New Transfer
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Operations */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Stock Adjustments */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-500/10 p-3">
                    <Settings className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Stock Adjustments</CardTitle>
                    <CardDescription>Inventory corrections & initial stock</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link href="/operations/adjustments" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      View History
                    </Button>
                  </Link>
                  <Link href="/operations/adjustments/new">
                    <Button>
                      New Adjustment
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Today's Activity</CardTitle>
                <CardDescription>Operations completed today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Receipts validated</span>
                    </div>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Deliveries shipped</span>
                    </div>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Pending operations</span>
                    </div>
                    <span className="font-bold">{waitingDeliveries + waitingReceipts}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
