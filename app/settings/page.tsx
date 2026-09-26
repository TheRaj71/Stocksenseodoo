import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Warehouse, MapPin, Users, Settings2, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const settingsLinks = [
    {
      title: "Warehouses",
      description: "Manage warehouses and storage facilities",
      href: "/settings/warehouses",
      icon: Warehouse,
      color: "bg-blue-500",
    },
    {
      title: "Locations",
      description: "Configure storage locations within warehouses",
      href: "/settings/locations",
      icon: MapPin,
      color: "bg-green-500",
    },
    {
      title: "Contacts",
      description: "Manage suppliers and customers",
      href: "/settings/contacts",
      icon: Users,
      color: "bg-purple-500",
    },
  ]

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
        <SiteHeader title="Settings" />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">System Settings</h2>
            <p className="text-muted-foreground text-lg">
              Configure warehouses, locations, and contacts
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {settingsLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`rounded-full ${link.color} bg-opacity-10 p-4`}>
                        <link.icon className={`h-8 w-8 text-${link.color.split('-')[1]}-600`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl flex items-center justify-between">
                          {link.title}
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {link.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Application Version</p>
                  <p className="text-lg font-semibold">StockSense v1.0</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Database</p>
                  <p className="text-lg font-semibold">PostgreSQL via Supabase</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Framework</p>
                  <p className="text-lg font-semibold">Next.js 16</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
