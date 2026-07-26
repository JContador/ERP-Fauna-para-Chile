// =============================================================================
// Acciones de clientes y contactos (escrituras).
// -----------------------------------------------------------------------------
// Nota (espíritu D2): los clientes NO se borran, se desactivan — pedidos y
// ubicaciones futuras pueden referenciarlos. Los contactos sí se pueden borrar
// de verdad: son solo datos de contacto, nada del historial de inventario
// depende de ellos.
// =============================================================================

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { clientes, contactos } from "@/db/schema";
import { obtenerUsuarioActual } from "@/lib/auth";

export type EstadoFormulario = {
  error?: string;
  errores?: Record<string, string>;
};

const TIPOS_VALIDOS = ["mayorista", "concesion", "ambos"] as const;
type TipoComercial = (typeof TIPOS_VALIDOS)[number];

// El RUT se normaliza para que "12.345.678-9" y "12345678-9" no queden como
// registros distintos: sin puntos ni espacios, con guión, con K en mayúscula.
function normalizarRut(texto: string): string {
  return texto.replace(/\./g, "").replace(/\s/g, "").toUpperCase();
}

function validarCampos(formData: FormData) {
  const errores: Record<string, string> = {};

  const nombre = String(formData.get("nombre") ?? "").trim();
  const rut = normalizarRut(String(formData.get("rut") ?? "").trim());
  const giro = String(formData.get("giro") ?? "").trim();
  const tipoComercial = String(formData.get("tipoComercial") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const condiciones = String(formData.get("condiciones") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();

  if (!nombre) errores.nombre = "El nombre es obligatorio.";

  if (!rut) errores.rut = "El RUT es obligatorio.";
  else if (!/^\d{7,8}-[\dK]$/.test(rut)) {
    errores.rut = "Formato inválido. Ej: 12345678-9";
  }

  if (!TIPOS_VALIDOS.includes(tipoComercial as TipoComercial)) {
    errores.tipoComercial = "Elige un tipo comercial válido.";
  }

  return {
    errores,
    valores: {
      nombre,
      rut,
      giro: giro || null,
      tipoComercial: tipoComercial as TipoComercial,
      region: region || null,
      condiciones: condiciones || null,
      notas: notas || null,
    },
  };
}

// ¿El error de la base de datos es "RUT repetido"? (violación de unicidad,
// código 23505 de Postgres). Drizzle envuelve el error original dentro de
// "cause", así que revisamos ambos niveles (mismo patrón que productos).
function esRutDuplicado(err: unknown): boolean {
  const codigoDe = (e: unknown): string | undefined =>
    typeof e === "object" && e !== null && "code" in e
      ? (e as { code?: string }).code
      : undefined;

  if (codigoDe(err) === "23505") return true;
  const causa = (err as { cause?: unknown })?.cause;
  return codigoDe(causa) === "23505";
}

export async function crearCliente(
  _previo: EstadoFormulario | undefined,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const { errores, valores } = validarCampos(formData);
  if (Object.keys(errores).length > 0) {
    return { error: "Revisa los campos marcados.", errores };
  }

  try {
    await db.insert(clientes).values(valores);
  } catch (err) {
    if (esRutDuplicado(err)) {
      return {
        error: "Revisa los campos marcados.",
        errores: { rut: `Ya existe un cliente con el RUT "${valores.rut}".` },
      };
    }
    throw err;
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function editarCliente(
  id: string,
  _previo: EstadoFormulario | undefined,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const { errores, valores } = validarCampos(formData);
  if (Object.keys(errores).length > 0) {
    return { error: "Revisa los campos marcados.", errores };
  }

  try {
    await db.update(clientes).set(valores).where(eq(clientes.id, id));
  } catch (err) {
    if (esRutDuplicado(err)) {
      return {
        error: "Revisa los campos marcados.",
        errores: { rut: `Ya existe otro cliente con el RUT "${valores.rut}".` },
      };
    }
    throw err;
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function cambiarEstadoCliente(id: string, estado: boolean) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return;

  await db.update(clientes).set({ estado }).where(eq(clientes.id, id));
  revalidatePath("/clientes");
}

// -----------------------------------------------------------------------------
// Contactos
// -----------------------------------------------------------------------------

export type EstadoContacto = { error?: string; ok?: boolean };

export async function crearContacto(
  clienteId: string,
  _previo: EstadoContacto | undefined,
  formData: FormData,
): Promise<EstadoContacto> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const cargo = String(formData.get("cargo") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const correo = String(formData.get("correo") ?? "").trim();

  if (!nombre) return { error: "El nombre del contacto es obligatorio." };

  await db.insert(contactos).values({
    clienteId,
    nombre,
    cargo: cargo || null,
    telefono: telefono || null,
    correo: correo || null,
  });

  revalidatePath(`/clientes/${clienteId}/editar`);
  return { ok: true };
}

export async function eliminarContacto(clienteId: string, contactoId: string) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return;

  await db.delete(contactos).where(eq(contactos.id, contactoId));
  revalidatePath(`/clientes/${clienteId}/editar`);
}
