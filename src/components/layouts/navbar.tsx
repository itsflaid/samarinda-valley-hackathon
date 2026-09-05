"use client";

import Link from "next/link";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { LogIn } from "lucide-react";
import Image from "next/image";
import { MobileNav } from "@/components/layouts/mobile-nav";
import { usePathname } from "next/navigation";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/wilayah", label: "Wilayah" },
    { href: "/fasilitas", label: "Fasilitas" },
    { href: "/lapor", label: "Lapor" },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
<<<<<<< HEAD
                <Link href="/" className="flex items-center gap-2 font-bold text-primary">
                    <Image src="/images/logos.webp" alt="SANITAIR" width={32} height={32} className="h-8 w-auto" />
=======
                <Link
                    href="/"
                    className="flex items-center gap-2 font-bold text-primary"
                >
                    <Image
                        src="/images/logos.webp"
                        alt="SANITAIR"
                        width={32}
                        height={32}
                        className="h-8 w-auto"
                    />
>>>>>>> 334f6f186167aa34294285d00751522e37bab653
                    <span className="text-lg tracking-tight">SANITAIR</span>
                </Link>

                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        {navLinks.map((link) => {
                            const isActive =
                                link.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(link.href);

                            return (
                                <NavigationMenuItem key={link.href}>
                                    <NavigationMenuLink
                                        href={link.href}
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "rounded-none border-b-2 font-medium",
                                            "hover:bg-primary/5 hover:text-primary hover:border-primary",
                                            isActive
                                                ? "border-primary"
                                                : "border-transparent"
                                        )}
                                    >
                                        {link.label}
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="hidden items-center gap-2 md:flex">
                    <Link href="/auth">
                        <Button
                            variant="outline"
                            className="border-secondary text-secondary-foreground hover:bg-secondary hover:text-white"
                        >
                            <LogIn className="size-4" />
                            Masuk
                        </Button>
                    </Link>
                </div>

                <div className="md:hidden">
                    <MobileNav />
                </div>
            </div>
        </nav>
    );
}