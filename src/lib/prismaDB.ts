import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "../../generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

console.log(process.env.DATABASE_URL, "DATABASE URL HERE")
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool as any);

export const prisma = new PrismaClient({
  adapter,
});