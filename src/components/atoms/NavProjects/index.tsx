"use client"

import type { LucideIcon } from "lucide-react"
import type { IconType } from "react-icons"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type ProjectItem = {
  name: string
  url: string
  icon: LucideIcon | IconType
}

export function NavProjects({
  title,
  projects,
}: {
  title: string
  projects: ProjectItem[]
}) {
  const pathname = usePathname()

  const isActiveRoute = (url: string) => {
    if (!url || url === "#") return false

    // Biar Dashboard tidak ikut aktif saat buka /dashboard/admin/transaksi
    if (url === "/dashboard/admin") {
      return pathname === url
    }

    // Untuk route lain, tetap aktif kalau masuk child route
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{title}</SidebarGroupLabel>

      <SidebarMenu>
        {projects.map((item) => {
          const active = isActiveRoute(item.url)

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={active}
                className={
                  active
                    ? "bg-[#6E06FF] text-white font-medium"
                    : "black hover:bg-white/10"
                }
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}