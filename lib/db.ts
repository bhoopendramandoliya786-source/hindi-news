import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function runtimeDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    // Vercel can run many warm serverless instances at once. Keep each
    // instance deliberately small so traffic spikes do not exhaust Postgres.
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

const datasourceUrl = runtimeDatabaseUrl();

// Reuse one Prisma client per warm serverless instance in production too.
// Creating a new client for every request can create too many Postgres
// connections and surface as intermittent Vercel 500 errors under traffic.
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasources: { db: { url: datasourceUrl } } } : {}),
    log: ["error"],
  });

globalForPrisma.prisma = db;
