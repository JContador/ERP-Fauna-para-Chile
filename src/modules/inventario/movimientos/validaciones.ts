// =============================================================================
// Validaciones de movimientos — lógica pura (D2, D10).
// -----------------------------------------------------------------------------
// No toca la base de datos: valida la FORMA de un movimiento (qué combinación
// de origen/destino tiene sentido para cada tipo) y genera el movimiento
// inverso para el botón "Deshacer".
// =============================================================================

export type TipoMovimiento =
  | "carga_inicial"
  | "despacho"
  | "venta"
  | "ajuste"
  | "devolucion"
  | "traspaso";

export type ResultadoValidacion = { valido: true } | { valido: false; error: string };

// Qué combinación de origen/destino exige cada tipo de movimiento.
// - "requerido": debe venir con un valor.
// - "vacio": debe venir vacío (null).
// - "uno": exactamente uno de los dos (origen o destino), no ambos ni ninguno.
const REGLAS_POR_TIPO: Record<
  TipoMovimiento,
  { origen: "requerido" | "vacio"; destino: "requerido" | "vacio" } | "uno"
> = {
  carga_inicial: { origen: "vacio", destino: "requerido" },
  despacho: { origen: "requerido", destino: "requerido" },
  venta: { origen: "requerido", destino: "vacio" },
  devolucion: { origen: "requerido", destino: "requerido" },
  traspaso: { origen: "requerido", destino: "requerido" },
  ajuste: "uno",
};

const NOMBRE_TIPO: Record<TipoMovimiento, string> = {
  carga_inicial: "Carga inicial",
  despacho: "Despacho",
  venta: "Venta",
  ajuste: "Ajuste",
  devolucion: "Devolución",
  traspaso: "Traspaso",
};

// Valida que la cantidad sea un entero positivo.
export function validarCantidad(cantidad: number): ResultadoValidacion {
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    return { valido: false, error: "La cantidad debe ser un número entero mayor a 0." };
  }
  return { valido: true };
}

// Valida que origen/destino tengan sentido para el tipo de movimiento elegido.
export function validarCombinacionUbicaciones(
  tipo: TipoMovimiento,
  origenId: string | null,
  destinoId: string | null,
): ResultadoValidacion {
  if (origenId && destinoId && origenId === destinoId) {
    return { valido: false, error: "El origen y el destino no pueden ser la misma ubicación." };
  }

  const regla = REGLAS_POR_TIPO[tipo];
  const nombre = NOMBRE_TIPO[tipo];

  if (regla === "uno") {
    const cantidadPresentes = [origenId, destinoId].filter(Boolean).length;
    if (cantidadPresentes !== 1) {
      return {
        valido: false,
        error: `Un "${nombre}" necesita exactamente una ubicación (origen si el stock baja, destino si sube).`,
      };
    }
    return { valido: true };
  }

  if (regla.origen === "requerido" && !origenId) {
    return { valido: false, error: `Un "${nombre}" necesita una ubicación de origen.` };
  }
  if (regla.origen === "vacio" && origenId) {
    return { valido: false, error: `Un "${nombre}" no debe tener ubicación de origen.` };
  }
  if (regla.destino === "requerido" && !destinoId) {
    return { valido: false, error: `Un "${nombre}" necesita una ubicación de destino.` };
  }
  if (regla.destino === "vacio" && destinoId) {
    return { valido: false, error: `Un "${nombre}" no debe tener ubicación de destino.` };
  }

  return { valido: true };
}

// El movimiento original a partir del cual se genera el inverso ("Deshacer").
export type MovimientoOriginal = {
  id: string;
  productoId: string;
  origenId: string | null;
  destinoId: string | null;
  cantidad: number;
};

// Datos para insertar el movimiento inverso. Siempre queda marcado como
// "ajuste" + referencia "correccion" apuntando al movimiento original, para
// que la analítica futura pueda excluirlo de la operación real.
export type MovimientoInverso = {
  productoId: string;
  origenId: string | null;
  destinoId: string | null;
  cantidad: number;
  tipo: "ajuste";
  referenciaTipo: "correccion";
  referenciaId: string;
};

export function crearMovimientoInverso(original: MovimientoOriginal): MovimientoInverso {
  return {
    productoId: original.productoId,
    origenId: original.destinoId,
    destinoId: original.origenId,
    cantidad: original.cantidad,
    tipo: "ajuste",
    referenciaTipo: "correccion",
    referenciaId: original.id,
  };
}
