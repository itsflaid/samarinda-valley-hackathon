"use client"

import * as React from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { IconType } from "react-icons"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url: string
  icon: LucideIcon | IconType
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({})

  const isActiveRoute = (url: string) => {
    if (!url || url === "#") return false
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  React.useEffect(() => {
    setOpenItems((prev) => {
      const next = { ...prev }

      items.forEach((item) => {
        const parentActive = item.items?.some((subItem) =>
          isActiveRoute(subItem.url)
        )

        if (parentActive) {
          next[item.title] = true
        }
      })

      return next
    })
  }, [pathname, items])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = !!item.items?.length

          const parentActive = hasChildren
            ? item.items?.some((subItem) => isActiveRoute(subItem.url))
            : isActiveRoute(item.url)

          const isOpen = openItems[item.title] ?? item.isActive ?? false

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={(value) => {
                setOpenItems((prev) => ({
                  ...prev,
                  [item.title]: value,
                }))
              }}
            >
              <SidebarMenuItem>
                                    <Link href={item.url}>

                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  
                  isActive={parentActive}
                  className={
                    parentActive
                    ? "bg-[#6E06FF]/70 text-white"
                    : ""
                  }
                  >
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenItems((prev) => ({
                          ...prev,
                          [item.title]: !isOpen,
                        }))
                      }}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  ) : (
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
                    </Link>

                {hasChildren ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const subActive = isActiveRoute(subItem.url)

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={subActive}
                                className={
                                  subActive
                                    ? "bg-[#6E06FF]/90 text-white font-medium"
                                    : ""
                                }
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}