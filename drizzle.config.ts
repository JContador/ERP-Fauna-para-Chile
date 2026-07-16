import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Carga las variables de entorno desde .env.local
config({ path: ".env.local" });

export default defineConfig({
  // Dónde vive el esquema (las tablas descritas en código)
  schema: "./src/db/schema.ts",
  // Dónde se guardan los archivos de migración generados
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Muestra advertencias claras antes de aplicar cambios
  verbose: true,
  strict: true,
});
