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
import { Search, Plus, ArrowRightLeft } from "lucide-react"
import Link from "next/link"

export default async function TransfersPage() {
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
        <SiteHeader title="Internal Transfers" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* Header Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transfers..."
                  className="pl-10"
                />
              </div>
            </div>
            <Link href="/operations/transfers/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                <span className="font-semibold">New Transfer</span>
              </Button>
            </Link>
          </div>

          {/* Transfers Table */}
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Reference</TableHead>
                  <TableHead className="font-bold">From Location</TableHead>
                  <TableHead className="font-bold">To Location</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <ArrowRightLeft className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-lg font-semibold">No transfers yet</p>
                    <p className="text-sm text-muted-foreground">
                      Create your first internal transfer to move stock between locations
                    </p>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
