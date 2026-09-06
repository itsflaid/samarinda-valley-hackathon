"use client";

import * as React from "react";
import {
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { IconType } from "react-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon | IconType;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

export function NavMain({
  items,
}: {
  items: NavItem[];
}) {
  const pathname = usePathname();

  const [openItems, setOpenItems] =
    React.useState<Record<string, boolean>>(
      {}
    );

  // =========================================================
  // CEK ROUTE AKTIF
  // =========================================================

  const isActiveRoute = React.useCallback(
    (url: string) => {
      if (!url || url === "#") {
        return false;
      }

      return (
        pathname === url ||
        pathname.startsWith(`${url}/`)
      );
    },
    [pathname]
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        Platform
      </SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const hasChildren =
            !!item.items?.length;

          const parentActive = hasChildren
            ? item.items?.some((subItem) =>
                isActiveRoute(subItem.url)
              ) ?? false
            : isActiveRoute(item.url);

          /*
           * Kalau parent aktif karena route,
           * otomatis dianggap terbuka.
           *
           * Tidak perlu useEffect + setState.
           */
          const isOpen =
            openItems[item.title] ??
            item.isActive ??
            parentActive;

          return (
            <Collapsible
              key={item.title}
              open={isOpen}
              onOpenChange={(value) => {
                setOpenItems((prev) => ({
                  ...prev,
                  [item.title]: value,
                }));
              }}
              render={<SidebarMenuItem />}
            >
              {/* ================================================= */}
              {/* PARENT MENU */}
              {/* ================================================= */}

              {hasChildren ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={parentActive}
                      className={
                        parentActive
                          ? "bg-[#6E06FF]/70 text-white"
                          : ""
                      }
                    >
                      <item.icon />

                      <span>
                        {item.title}
                      </span>
                    </SidebarMenuButton>

                    <CollapsibleTrigger
                      render={
                        <SidebarMenuAction className="data-[state=open]:rotate-90" />
                      }
                    >
                      <ChevronRight />

                      <span className="sr-only">
                        Toggle
                      </span>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>

                  {/* ================================================= */}
                  {/* SUB MENU */}
                  {/* ================================================= */}

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map(
                        (subItem) => {
                          const subActive =
                            isActiveRoute(
                              subItem.url
                            );

                          return (
                            <SidebarMenuSubItem
                              key={
                                subItem.title
                              }
                            >
                              <SidebarMenuSubButton
                                asChild
                                isActive={
                                  subActive
                                }
                                className={
                                  subActive
                                    ? "bg-[#6E06FF]/90 text-white font-medium"
                                    : ""
                                }
                              >
                                <Link
                                  href={
                                    subItem.url
                                  }
                                >
                                  <span>
                                    {
                                      subItem.title
                                    }
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        }
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                /* ================================================= */
                /* MENU TANPA CHILDREN */
                /* ================================================= */

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={
                      parentActive
                    }
                    className={
                      parentActive
                        ? "bg-[#6E06FF]/70 text-white"
                        : ""
                    }
                  >
                    <Link href={item.url}>
                      <item.icon />

                      <span>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}