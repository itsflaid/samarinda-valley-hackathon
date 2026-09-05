"use client"

import * as React from "react"
import { Frame, LifeBuoy, Send } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import logo from "../../../../public/images/logo.webp"
import { NavMain } from "@/components/atoms/NavMain"
import { NavProjects } from "@/components/atoms/NavProjects"
import { NavSecondary } from "@/components/atoms/NavSecondary"
import { NavUser } from "@/components/atoms/NavUser"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  HiOutlineSquares2X2,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
} from "react-icons/hi2"


import { PiClockClockwiseBold } from "react-icons/pi"
// import { useProfile } from "@/hooks/use-profile"

const data = {

  navSecondary: [
    {
      title: "Support",
      url: "/dashboard/admin/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/dashboard/admin/feedback",
      icon: Send,
    },
  ],

  dashboard: [
    {
      name: "Dashboard",
      url: "/admin/dashboard",
      icon: HiOutlineSquares2X2,
    },
  ],

  lainnya: [
    {
      name: "Nakes",
      url: "/admin/nakes",
      icon: HiOutlineUserGroup,
    },
    {
      name: "Petugas",
      url: "/admin/petugas",
      icon: HiOutlineShieldCheck,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const { data: user, isLoading, error } = useProfile()
  const user = {
    name: "test",
    email: "test@admin.com",
    nohp: "082253129334"
  }


  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image src={logo} alt="tayama" className="h-8 w-8" />
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium tracking-wider">SANITAIR</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavProjects projects={data.dashboard} title="Dashboard" />
        <NavProjects projects={data.lainnya} title="Manajemen Nakesh & Penjaga" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} imageSrc={logo} />
      </SidebarFooter>
    </Sidebar>
  )
}