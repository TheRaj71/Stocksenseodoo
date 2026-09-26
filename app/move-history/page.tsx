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
import { 
  Search, 
  History, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowRightLeft,
  Settings,
  TrendingUp,
  TrendingDown,
  Calendar
} from "lucide-react"
import { getRecentStockMovements } from "@/app/actions/dashboard"
import { format } from "date-fns"
import Link from "next/link"

export default async function MoveHistoryPage() {
  const movementsResult = await getRecentStockMovements() // Get recent movements
  const movements = movementsResult.success ? movementsResult.data : []

  // Calculate stats
  const totalMovements = movements?.length || 0
  const receipts = movements?.filter((m: any) => m.type === 'RECEIPT').length || 0
  const deliveries = movements?.filter((m: any) => m.type === 'DELIVERY').length || 0
  const transfers = movements?.filter((m: any) => m.type === 'TRANSFER').length || 0
  const adjustments = movements?.filter((m: any) => m.type === 'ADJUSTMENT').length || 0

  // Group movements by date for timeline
  const movementsByDate = movements?.reduce((acc: any, movement: any) => {
    if (!movement.scheduleDate) {
      const date = 'Unknown'
      if (!acc[date]) acc[date] = []
      acc[date].push(movement)
      return acc
    }
    
    try {
      const dateObj = new Date(movement.scheduleDate)
      if (isNaN(dateObj.getTime())) {
        const date = 'Unknown'
        if (!acc[date]) acc[date] = []
        acc[date].push(movement)
        return acc
      }
      const date = format(dateObj, 'yyyy-MM-dd')
      if (!acc[date]) acc[date] = []
      acc[date].push(movement)
    } catch {
      const date = 'Unknown'
      if (!acc[date]) acc[date] = []
      acc[date].push(movement)
    }
    return acc
  }, {})

  const sortedDates = Object.keys(movementsByDate || {}).sort().reverse()

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'RECEIPT':
        return <ArrowDownToLine className="h-4 w-4 text-blue-600" />
      case 'DELIVERY':
        return <ArrowUpFromLine className="h-4 w-4 text-green-600" />
      case 'TRANSFER':
        return <ArrowRightLeft className="h-4 w-4 text-purple-600" />
      case 'ADJUSTMENT':
        return <Settings className="h-4 w-4 text-orange-600" />
      default:
        return <History className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { variant: any; label: string; color: string }> = {
      RECEIPT: { variant: "default", label: "Receipt", color: "bg-blue-100 text-blue-800" },
      DELIVERY: { variant: "default", label: "Delivery", color: "bg-green-100 text-green-800" },
      TRANSFER: { variant: "default", label: "Transfer", color: "bg-purple-100 text-purple-800" },
      ADJUSTMENT: { variant: "default", label: "Adjustment", color: "bg-orange-100 text-orange-800" },
    }
    const config = configs[type] || { variant: "secondary", label: type, color: "" }
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

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
        <SiteHeader title="Movement History" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMovements}</div>
                <p className="text-xs text-muted-foreground">All stock operations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receipts</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{receipts}</div>
                <p className="text-xs text-muted-foreground">Incoming goods</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deliveries</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{deliveries}</div>
                <p className="text-xs text-muted-foreground">Outgoing shipments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Other Operations</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transfers + adjustments}</div>
                <p className="text-xs text-muted-foreground">Transfers & adjustments</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, product, or contact..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Movement Tabs */}
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList>
              <TabsTrigger value="timeline">
                <Calendar className="h-4 w-4 mr-2" />
                Timeline View
              </TabsTrigger>
              <TabsTrigger value="all">All ({totalMovements})</TabsTrigger>
              <TabsTrigger value="receipts">Receipts ({receipts})</TabsTrigger>
              <TabsTrigger value="deliveries">Deliveries ({deliveries})</TabsTrigger>
            </TabsList>

            {/* Timeline View */}
            <TabsContent value="timeline" className="space-y-6">
              {sortedDates.map((date: string) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5" />
                      {date === 'Unknown' ? 'Unknown Date' : format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                    <CardDescription>
                      {movementsByDate[date].length} movement(s) on this day
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {movementsByDate[date].map((movement: any) => (
                        <div key={movement.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="mt-1">
                            {getMovementIcon(movement.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Link
                                href={movement.type ? `/operations/${movement.type.toLowerCase()}s/${movement.id}` : '#'}
                                className="font-mono font-semibold hover:underline"
                              >
                                {movement.reference}
                              </Link>
                              {getTypeBadge(movement.type)}
                              <Badge variant={movement.status === 'DONE' ? 'default' : 'secondary'}>
                                {movement.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {movement.Contact?.name && (
                                <span>Contact: {movement.Contact.name} • </span>
                              )}
                              {movement.destination_location?.name && (
                                <span>To: {movement.destination_location.name}</span>
                              )}
                              {movement.source_location?.name && (
                                <span>From: {movement.source_location.name}</span>
                              )}
                            </div>
                            {movement.notes && (
                              <p className="text-sm text-muted-foreground italic">{movement.notes}</p>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">{movement.lines?.length || 0} items</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {sortedDates.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <History className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-lg font-semibold">No movements found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Table Views */}
            {['all', 'receipts', 'deliveries'].map((tab) => (
              <TabsContent key={tab} value={tab} className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Reference</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Contact/Location</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements
                      ?.filter((m: any) => {
                        if (tab === 'all') return true
                        if (tab === 'receipts') return m.type === 'RECEIPT'
                        if (tab === 'deliveries') return m.type === 'DELIVERY'
                        return true
                      })
                      .map((movement: any) => (
                        <TableRow key={movement.id}>
                          <TableCell className="font-mono font-semibold">
                            <Link
                              href={movement.type ? `/operations/${movement.type.toLowerCase()}s/${movement.id}` : '#'}
                              className="hover:underline"
                            >
                              {movement.reference}
                            </Link>
                          </TableCell>
                          <TableCell>{getTypeBadge(movement.type)}</TableCell>
                          <TableCell>
                            {movement.Contact?.name || movement.destination_location?.name || movement.source_location?.name || '-'}
                          </TableCell>
                          <TableCell>
                            {movement.scheduleDate
                              ? format(new Date(movement.scheduleDate), 'MMM dd, yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={movement.status === 'DONE' ? 'default' : 'secondary'}>
                              {movement.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{movement.lines?.length || 0}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
