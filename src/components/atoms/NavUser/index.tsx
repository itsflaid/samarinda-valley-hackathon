"use client"

import {
    Bell,
    ChevronsUpDown,
    LogOut,
    Trash2Icon,
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

import { useState } from "react"
import { toast } from "sonner"
import { signOut } from "next-auth/react"
import { StaticImageData } from "next/image"
import { useRouter } from "next/navigation"

import profileImg from "../../../../public/images/user-ava.webp"

export function NavUser({
    user,
    imageSrc,
}: {
    user: {
        name: string
        email: string
        nohp: string
        role: string
    }
    imageSrc: string | StaticImageData
}) {
    const { isMobile } = useSidebar()

    const [open, setOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const router = useRouter()

    const avatarSrc =
        typeof imageSrc === "string"
            ? imageSrc
            : profileImg.src

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>

                    <DropdownMenu>

                        {/* TRIGGER */}
                        <DropdownMenuTrigger
                            render={
                                <div
                                    className="
                                        flex w-full items-center gap-2
                                        overflow-hidden rounded-md
                                        px-2 py-2
                                        cursor-pointer
                                        hover:bg-sidebar-accent
                                        hover:text-sidebar-accent-foreground
                                    "
                                />
                            }
                        >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={avatarSrc}
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user.name}
                                    </span>

                                    <span className="truncate text-xs">
                                        {user.email}
                                    </span>
                                </div>

                                <ChevronsUpDown className="ml-auto size-4" />
                        </DropdownMenuTrigger>


                        {/* DROPDOWN */}
                        <DropdownMenuContent
                            className="w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                        >

                            {/* USER INFO */}
                            <div className="flex items-center gap-2 px-2 py-2">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={avatarSrc}
                                        alt={user.name}
                                    />

                                    <AvatarFallback className="rounded-lg">
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user.name}
                                    </span>

                                    <span className="truncate text-xs">
                                        {user.email}
                                    </span>

                                    <span className="truncate text-xs">
                                        {user.nohp}
                                    </span>
                                    <span className="truncate text-xs font-medium">
                                        {user.role}
                                    </span>
                                </div>
                            </div>


                            <DropdownMenuGroup>

                            </DropdownMenuGroup>


                            <DropdownMenuSeparator />


                            {/* LOGOUT */}
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                    setOpen(true)
                                }}
                            >
                                <LogOut />
                                Logout
                            </DropdownMenuItem>

                        </DropdownMenuContent>

                    </DropdownMenu>

                </SidebarMenuItem>
            </SidebarMenu>


            {/* LOGOUT CONFIRMATION */}
            <AlertDialog
                open={open}
                onOpenChange={setOpen}
            >
                <AlertDialogContent size="default">

                    <AlertDialogHeader>

                        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash2Icon />
                        </AlertDialogMedia>

                        <AlertDialogTitle>
                            Yakin Ingin Logout?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Login kembali untuk mengakses akun anda!
                        </AlertDialogDescription>

                    </AlertDialogHeader>


                    <AlertDialogFooter>

                        <AlertDialogCancel variant="outline">
                            Cancel
                        </AlertDialogCancel>

                        <button
                            type="button"
                            disabled={isLoggingOut}
                            onClick={async () => {
                                setIsLoggingOut(true)

                                const toastId = toast.loading("Proses logout...", {
                                    position: "top-center",
                                })

                                try {
                                    await signOut({
                                        redirect: false,
                                    })

                                    toast.success("Berhasil logout!", {
                                        id: toastId,
                                        position: "top-right",
                                    })

                                    setOpen(false)

                                    router.push("/auth")
                                    router.refresh()
                                } catch (error) {
                                    console.error("LOGOUT ERROR:", error)

                                    toast.error("Gagal logout", {
                                        id: toastId,
                                        position: "top-center",
                                    })
                                } finally {
                                    setIsLoggingOut(false)
                                }
                            }}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
                        >
                            Logout
                        </button>

                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}