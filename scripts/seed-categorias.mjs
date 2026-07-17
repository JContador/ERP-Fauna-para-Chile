// =============================================================================
// Poblar las categorías iniciales de producto.
// -----------------------------------------------------------------------------
// Inserta las categorías reales de la tienda de Fauna para Chile. Es idempotente:
// se puede correr varias veces sin duplicar (usa "on conflict do nothing").
//
// Cómo correrlo:  npm run db:seed:categorias
// =============================================================================

import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const CATEGORIAS = [
  "Figuras 3D",
  "Mini Fauna",
  "Llaveros 3D",
  "Botellas",
  "Cuadernos de Campo",
  "Libros",
  "Descargables",
];

const sql = postgres(process.env.DATABASE_URL, { connect_timeout: 15 });

let insertadas = 0;
for (const nombre of CATEGORIAS) {
  const res = await sql`
    insert into categorias (nombre) values (${nombre})
    on conflict (nombre) do nothing
    returning id`;
  if (res.length) insertadas++;
}

const total = await sql`select count(*)::int as n from categorias`;
console.log(`Categorías nuevas insertadas: ${insertadas}. Total en la base: ${total[0].n}.`);
await sql.end();
