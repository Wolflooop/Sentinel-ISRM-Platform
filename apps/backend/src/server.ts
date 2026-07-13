import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Sentinel ISRM backend escuchando en el puerto ${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`Señal ${signal} recibida. Cerrando servidor...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Servidor y conexión a Prisma cerrados correctamente.");
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
