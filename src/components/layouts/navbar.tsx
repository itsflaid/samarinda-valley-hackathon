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
import { Droplets, LogIn } from "lucide-react";
import { MobileNav } from "@/components/layouts/mobile-nav";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/wilayah", label: "Wilayah" },
    { href: "/fasilitas", label: "Fasilitas" },
    { href: "/lapor", label: "Lapor" },
];

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                <Link href="/" className="flex items-center gap-2 font-bold text-primary">
                    <Droplets className="h-6 w-6" />
                    <span className="text-lg tracking-tight">SANITAIR</span>
                </Link>

                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        {navLinks.map((link) => (
                            <NavigationMenuItem key={link.href}>
                                <NavigationMenuLink
                                    href={link.href}
                                    className={cn(
                                        navigationMenuTriggerStyle(),
                                        "rounded-none border-b-2 border-transparent font-medium",
                                        "hover:bg-primary/5 hover:text-primary hover:border-primary"
                                    )}
                                >
                                    {link.label}
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
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