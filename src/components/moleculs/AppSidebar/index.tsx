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


import { PiClockClockwiseBold } from "react-icons/pi";
import { useSession } from "next-auth/react"
// import { useProfile } from "@/hooks/use-profile"

const sidebarData = {
  ADMIN: {
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
      {
        name: "Fasilitas",
        url: "/admin/facility",
        icon: HiOutlineShieldCheck,
      },
    ],
  },

  NAKES: {
    dashboard: [
      {
        name: "Dashboard",
        url: "/nakes/dashboard",
        icon: HiOutlineSquares2X2,
      },
    ],
    lainnya: [
      {
        name: "Pemeriksaan",
        url: "/nakes/pemeriksaan",
        icon: HiOutlineUserGroup,
      },
      {
        name: "Peringatan",
        url: "/nakes/peringatan",
        icon: HiOutlineShieldCheck,
      },
    ],
  },

  PETUGAS: {
    dashboard: [
      {
        name: "Dashboard",
        url: "/petugas/dashboard",
        icon: HiOutlineSquares2X2,
      },
    ],
    lainnya: [
      {
        name: "Status",
        url: "/petugas/status",
        icon: HiOutlineUserGroup,
      },
      {
        name: "Tugas Lapangan",
        url: "/petugas/tugas",
        icon: HiOutlineShieldCheck,
      },
    ],
  },
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const { data: user, isLoading, error } = useProfile()
  const { data: session, status } = useSession()

  const role = session?.user?.role

  const data = sidebarData[role as keyof typeof sidebarData]

  const user = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "-",
    nohp: session?.user?.nohp ?? "-",
    role: session?.user?.role ?? "-",
  }


  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image src={logo} alt="SANITAIR" className="h-8 w-12" />
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
        {data && (
          <>
            <NavProjects projects={data.dashboard} title="Dashboard" />
            <NavProjects projects={data.lainnya} title="Menu" />
          </>
        )}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} imageSrc={logo} />
      </SidebarFooter>
    </Sidebar>
  )
}