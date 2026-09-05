import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name: string
            email: string
            nohp: string
            role: "ADMIN" | "NAKES" | "PETUGAS"
            profesi?: "DOKTER" | "PERAWAT" | "BIDAN" | null
            instansi?: string | null
            wilayahKerja?: string | null
        }
    }

    interface User {
        id: string
        name: string
        email: string
        nohp: string
        role: "ADMIN" | "NAKES" | "PETUGAS"
        profesi?: "DOKTER" | "PERAWAT" | "BIDAN" | null
        instansi?: string | null
        wilayahKerja?: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        name: string
        email: string
        nohp: string
        role: "ADMIN" | "NAKES" | "PETUGAS"
        profesi?: "DOKTER" | "PERAWAT" | "BIDAN" | null
        instansi?: string | null
        wilayahKerja?: string | null
    }
}