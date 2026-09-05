import "dotenv/config";
import { PrismaClient, Role } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.upsert({
        where: {
            email: "admin@siaga.com",
        },
        update: {},
        create: {
            name: "Administrator SIAGA",
            email: "admin@siaga.com",
            nohp: "628000000000",
            password: hashedPassword,
            role: Role.ADMIN,
            instansi: "SIAGA",
        },
    });

    console.log("Admin berhasil dibuat:");
    console.log(admin.email);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });