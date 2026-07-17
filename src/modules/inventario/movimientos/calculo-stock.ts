// =============================================================================
// Cálculo de stock — lógica pura (D1, D2, D10).
// -----------------------------------------------------------------------------
// El stock de una ubicación NUNCA se guarda como número editable: siempre se
// calcula sumando los movimientos que llegaron y restando los que salieron.
// Esta función no toca la base de datos, por eso se puede probar aislada.
// =============================================================================

export type MovimientoParaCalculo = {
  origenId: string | null;
  destinoId: string | null;
  cantidad: number;
};

// Stock = (suma de lo que llegó a la ubicación) − (suma de lo que salió de ella).
export function calcularStock(
  movimientos: MovimientoParaCalculo[],
  ubicacionId: string,
): number {
  return movimientos.reduce((total, m) => {
    let delta = 0;
    if (m.destinoId === ubicacionId) delta += m.cantidad;
    if (m.origenId === ubicacionId) delta -= m.cantidad;
    return total + delta;
  }, 0);
}

// -----------------------------------------------------------------------------
// Stock de TODOS los productos en TODAS las ubicaciones, de una sola pasada.
// -----------------------------------------------------------------------------
// Para la vista de stock (Paso 4) se necesita el stock de cada combinación
// producto+ubicación. Recorrer calcularStock() una vez por cada combinación
// sería lento con muchos productos/ubicaciones; esta función acumula todo en
// un solo recorrido de los movimientos.

export type MovimientoConProducto = MovimientoParaCalculo & { productoId: string };

// Clave estable para guardar/leer el stock de un producto en una ubicación.
export function claveStock(productoId: string, ubicacionId: string): string {
  return `${productoId}::${ubicacionId}`;
}

export function calcularStockPorProductoYUbicacion(
  movimientos: MovimientoConProducto[],
): Map<string, number> {
  const stock = new Map<string, number>();

  const sumar = (productoId: string, ubicacionId: string, delta: number) => {
    const clave = claveStock(productoId, ubicacionId);
    stock.set(clave, (stock.get(clave) ?? 0) + delta);
  };

  for (const m of movimientos) {
    if (m.destinoId) sumar(m.productoId, m.destinoId, m.cantidad);
    if (m.origenId) sumar(m.productoId, m.origenId, -m.cantidad);
  }

  return stock;
}
