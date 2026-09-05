import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email dan password wajib diisi" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Email atau password salah" },
                { status: 401 }
            );
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return NextResponse.json(
                { message: "Email atau password salah" },
                { status: 401 }
            );
        }

        let redirectTo = "/";

        if (user.role === "ADMIN") {
            redirectTo = "/admin/dashboard";
        }

        if (user.role === "NAKES") {
            redirectTo = "/nakes/dashboard";
        }

        if (user.role === "PETUGAS") {
            redirectTo = "/petugas/dashboard";
        }

        // Buat response
        const response = NextResponse.json({
            message: "Login berhasil",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                nohp: user.nohp,
                role: user.role,
                profesi: user.profesi,
                instansi: user.instansi,
                wilayahKerja: user.wilayahKerja,
            },
            redirectTo,
        });

        // Simpan session sederhana di cookie
        response.cookies.set("session", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 hari
        });

        return response;
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}