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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Users, TrendingUp, TrendingDown } from "lucide-react"
import { getContacts } from "@/app/actions/contacts"

export default async function ContactsPage() {
  const contactsResult = await getContacts()
  const contacts = contactsResult.success ? contactsResult.data : []

  const totalContacts = contacts?.length || 0
  const vendors = contacts?.filter((c: any) => c.type === 'VENDOR').length || 0
  const customers = contacts?.filter((c: any) => c.type === 'CUSTOMER').length || 0
  const activeContacts = contacts?.filter((c: any) => c.active).length || 0

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
        <SiteHeader title="Contacts" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalContacts}</div>
                <p className="text-xs text-muted-foreground">{activeContacts} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendors</CardTitle>
                <TrendingDown className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{vendors}</div>
                <p className="text-xs text-muted-foreground">Suppliers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{customers}</div>
                <p className="text-xs text-muted-foreground">Buyers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalContacts > 0 ? Math.round((activeContacts / totalContacts) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Active contacts</p>
              </CardContent>
            </Card>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search contacts..." className="pl-10" />
              </div>
            </div>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Add Contact</span>
            </Button>
          </div>

          {/* Contacts Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({totalContacts})</TabsTrigger>
              <TabsTrigger value="vendors">Vendors ({vendors})</TabsTrigger>
              <TabsTrigger value="customers">Customers ({customers})</TabsTrigger>
            </TabsList>

            {['all', 'vendors', 'customers'].map((tab) => (
              <TabsContent key={tab} value={tab} className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Email</TableHead>
                      <TableHead className="font-bold">Phone</TableHead>
                      <TableHead className="font-bold">Address</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts
                      ?.filter((c: any) => {
                        if (tab === 'all') return true
                        if (tab === 'vendors') return c.type === 'VENDOR'
                        if (tab === 'customers') return c.type === 'CUSTOMER'
                        return true
                      })
                      .map((contact: any) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-semibold">{contact.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                contact.type === 'VENDOR'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }
                            >
                              {contact.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{contact.email || '-'}</TableCell>
                          <TableCell>{contact.phone || '-'}</TableCell>
                          <TableCell>
                            {contact.address ? (
                              <div className="text-sm max-w-xs truncate">{contact.address}</div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={contact.active ? 'default' : 'secondary'}>
                              {contact.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    {contacts?.filter((c: any) => {
                      if (tab === 'all') return true
                      if (tab === 'vendors') return c.type === 'VENDOR'
                      if (tab === 'customers') return c.type === 'CUSTOMER'
                      return true
                    }).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-lg font-semibold">No contacts found</p>
                        </TableCell>
                      </TableRow>
                    )}
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
