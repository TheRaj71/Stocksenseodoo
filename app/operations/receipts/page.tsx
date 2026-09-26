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
import { Search, Plus, MoreVertical, Package } from "lucide-react"
import Link from "next/link"
import { getReceipts, getReceiptsByStatus } from "@/app/actions/receipts"
import { format } from "date-fns"

export default async function ReceiptsPage() {
  // Fetch receipts by status
  const allReceiptsResult = await getReceipts()
  const draftReceiptsResult = await getReceiptsByStatus('DRAFT')
  const waitingReceiptsResult = await getReceiptsByStatus('WAITING')
  const doneReceiptsResult = await getReceiptsByStatus('DONE')
  
  const allReceipts = allReceiptsResult.success ? allReceiptsResult.data : []
  const draftReceipts = draftReceiptsResult.success ? draftReceiptsResult.data : []
  const waitingReceipts = waitingReceiptsResult.success ? waitingReceiptsResult.data : []
  const doneReceipts = doneReceiptsResult.success ? doneReceiptsResult.data : []

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      DRAFT: { variant: "secondary", label: "Draft" },
      WAITING: { variant: "outline", label: "Waiting" },
      DONE: { variant: "default", label: "Done" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
    }
    const config = variants[status] || { variant: "secondary", label: status }
    return (
      <Badge variant={config.variant} className={
        status === 'WAITING' ? 'bg-yellow-500 text-white' :
        status === 'DONE' ? 'bg-green-500 text-white' : ''
      }>
        {config.label}
      </Badge>
    )
  }

  const renderReceiptsTable = (receipts: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold">Reference</TableHead>
          <TableHead className="font-bold">Supplier</TableHead>
          <TableHead className="font-bold">Destination</TableHead>
          <TableHead className="font-bold">Scheduled Date</TableHead>
          <TableHead className="font-bold">Status</TableHead>
          <TableHead className="font-bold">Items</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {receipts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-lg font-semibold">No receipts found</p>
              <p className="text-sm text-muted-foreground">
                Create your first receipt to get started
              </p>
            </TableCell>
          </TableRow>
        ) : (
          receipts.map((receipt: any) => (
            <TableRow key={receipt.id}>
              <TableCell>
                <Link
                  href={`/operations/receipts/${receipt.id}`}
                  className="font-mono font-semibold hover:underline"
                >
                  {receipt.reference}
                </Link>
              </TableCell>
              <TableCell className="font-medium">
                {receipt.Contact?.name || "N/A"}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{receipt.destination_location?.name || "N/A"}</div>
                  <div className="text-muted-foreground text-xs">
                    {receipt.destination_location?.Warehouse?.name || ""}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {receipt.scheduleDate ? 
                  format(new Date(receipt.scheduleDate), "MMM dd, yyyy") : 
                  "N/A"
                }
              </TableCell>
              <TableCell>{getStatusBadge(receipt.status)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {receipt.lines?.length || 0} items
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
                    <Link href={`/operations/receipts/${receipt.id}`}>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                    </Link>
                    {receipt.status === 'DRAFT' && (
                      <Link href={`/operations/receipts/${receipt.id}/edit`}>
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
        <SiteHeader title="Receipts" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* Header Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search receipts by reference or supplier..."
                  className="pl-10"
                />
              </div>
            </div>
            <Link href="/operations/receipts/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                <span className="font-semibold">New Receipt</span>
              </Button>
            </Link>
          </div>

          {/* Receipts Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All ({allReceipts?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Draft ({draftReceipts?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="waiting">
                Waiting ({waitingReceipts?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="done">
                Done ({doneReceipts?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="rounded-lg border bg-card">
              {renderReceiptsTable(allReceipts || [])}
            </TabsContent>

            <TabsContent value="draft" className="rounded-lg border bg-card">
              {renderReceiptsTable(draftReceipts || [])}
            </TabsContent>

            <TabsContent value="waiting" className="rounded-lg border bg-card">
              {renderReceiptsTable(waitingReceipts || [])}
            </TabsContent>

            <TabsContent value="done" className="rounded-lg border bg-card">
              {renderReceiptsTable(doneReceipts || [])}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
