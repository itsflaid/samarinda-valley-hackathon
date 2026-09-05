import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            name,
            email,
            nohp,
            password,
            profesi,
            instansi,
            wilayah_kerja,
        } = body;

        if (
            !name ||
            !email ||
            !nohp ||
            !password ||
            !profesi ||
            !instansi ||
            !wilayah_kerja
        ) {
            return NextResponse.json(
                { message: "Semua field wajib diisi" },
                { status: 400 }
            );
        }

        const existingNakes = await prisma.nakes.findFirst({
            where: {
                OR: [
                    { email },
                    { nohp },
                ],
            },
        });

        if (existingNakes) {
            return NextResponse.json(
                { message: "Email atau nomor HP sudah terdaftar" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const nakes = await prisma.nakes.create({
            data: {
                name,
                email,
                nohp,
                password: hashedPassword,
                profesi: profesi.toUpperCase(),
                instansi,
                wilayahKerja: wilayah_kerja,
            },
        });

        return NextResponse.json(
            {
                message: "Registrasi berhasil",
                user: {
                    id: nakes.id,
                    name: nakes.name,
                    email: nakes.email,
                },
                redirectTo: "/dashboard",
            },
            { status: 201 }
        );

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}