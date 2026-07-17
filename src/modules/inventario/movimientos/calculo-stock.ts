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
