import { PrismaClient } from "@prisma/client";
console.log("Meow");
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
