"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { LogIn, MenuIcon } from "lucide-react";
import Image from "next/image";

const links = [
    { href: "/", label: "Home" },
    { href: "/wilayah", label: "Wilayah" },
    { href: "/fasilitas", label: "Fasilitas" },
    { href: "/lapor", label: "Lapor" },
];

export function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                <MenuIcon className="size-5" />
                <span className="sr-only">Menu</span>
            </SheetTrigger>

            <SheetContent side="left" showCloseButton={false}>
                <SheetHeader>
                    <SheetTitle>
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-bold text-primary"
                            onClick={() => setOpen(false)}
                        >
                            <Image src="/images/logos.webp" alt="SANITAIR" width={28} height={28} className="h-5 w-auto" />
                            SANITAIR
                        </Link>
                    </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1 px-4">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex flex-col gap-2 px-4 pt-4 pb-6 border-t border-border mt-auto">
                    <Button
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                    >
                        <LogIn className="size-4" />
                        Masuk
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
