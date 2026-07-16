// =============================================================================
// Conexión a la base de datos — ERP Fauna para Chile
// -----------------------------------------------------------------------------
// Este archivo crea el "cliente" que la aplicación usa para leer y escribir en
// la base de datos. Se importa desde el resto del código con:  import { db } ...
// =============================================================================

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Falta la variable DATABASE_URL. Revisa tu archivo .env.local (ver .env.local.example).",
  );
}

// Un único cliente reutilizable. En desarrollo, Next.js recarga el código muchas
// veces; guardamos el cliente en una variable global para no abrir conexiones de más.
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb.client ?? postgres(connectionString, { prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
