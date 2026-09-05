"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Spinner } from "@/components/ui/spinner"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { Trash2Icon } from "lucide-react"
// import { logout } from "@/services/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { StaticImageData } from "next/image"
import profileImg from '../../../../public/images/user-ava.webp'

export function NavUser({
  user,
  imageSrc
}: {
  user: {
    name: string
    email: string
    nohp: string
  }
  imageSrc: string | StaticImageData;
}) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLogingOut] = useState(false)
  const router = useRouter()

const avatarSrc =
  typeof imageSrc === "string" ? imageSrc :  profileImg.src

  

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatarSrc} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarSrc} alt={user.name} />
                  <AvatarFallback className="rounded-lg">Test</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                  <span className="truncate text-xs">{user.nohp}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => {
                e.preventDefault()
                setOpen(true)
              }}
            >
              <LogOut />
              Logout
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="default">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Yakin Ingin Logout ?</AlertDialogTitle>
            <AlertDialogDescription>
              Login kembali untuk mengakses akun anda!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isLoggingOut}
             onClick={async (e) => {
               e.preventDefault()
               const toastId = toast.loading("Proses Logout...", {
                position: "top-center"
               })
              try {
                setIsLogingOut(true)
                const res = await logout()
                toast.success("berhasil logout!", {
                  id: toastId,
                  position: "top-center" })
                setOpen(false)
                router.push(res.redirectTo)
              } catch (error) {
                toast.error("gagal menghapus sesi")
                console.log(error)
              } finally {
                setIsLogingOut(false)
              }
            }} variant="destructive">
              {isLoggingOut ? (
                <>
                <Spinner className="size-4"/>
                Logout
                </>    
              ) : (
                "Logout"
              )
            }
              </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenu>
  )
}
// <LogOut />
