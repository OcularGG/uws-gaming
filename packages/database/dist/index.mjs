// src/index.ts
import { PrismaClient } from "@prisma/client";
export * from "@prisma/client";
var prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"]
    });
  }
  prisma = global.__prisma;
}
export {
  prisma
};
