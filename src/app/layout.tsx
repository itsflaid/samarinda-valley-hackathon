// src/app/layout.tsx

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layouts/navbar";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SANITAIR",
  description: "Deteksi resiko kesehatan akibat kondisi air Kaltim",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="antialiased">
        <Navbar />

        <main>{children}</main>
      </body>
    </html>
  );
}