import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json({
            message: "Logout berhasil",
            redirectTo: "/login",
        });

        response.cookies.delete("session");

        return response;
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Gagal logout",
            },
            {
                status: 500,
            }
        );
    }
}