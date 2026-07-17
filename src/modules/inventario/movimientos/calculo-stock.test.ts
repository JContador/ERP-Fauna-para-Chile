import { describe, it, expect } from "vitest";
import { calcularStock } from "./calculo-stock";

const BODEGA = "bodega-1";
const TIENDA = "tienda-1";
const OTRA = "otra-ubicacion";

describe("calcularStock", () => {
  it("devuelve 0 sin movimientos", () => {
    expect(calcularStock([], BODEGA)).toBe(0);
  });

  it("una carga inicial suma al destino", () => {
    const movimientos = [{ origenId: null, destinoId: BODEGA, cantidad: 50 }];
    expect(calcularStock(movimientos, BODEGA)).toBe(50);
  });

  it("una venta resta del origen", () => {
    const movimientos = [
      { origenId: null, destinoId: TIENDA, cantidad: 20 },
      { origenId: TIENDA, destinoId: null, cantidad: 5 },
    ];
    expect(calcularStock(movimientos, TIENDA)).toBe(15);
  });

  it("un despacho resta de bodega y suma a la tienda, sin afectar otras ubicaciones", () => {
    const movimientos = [
      { origenId: null, destinoId: BODEGA, cantidad: 100 },
      { origenId: BODEGA, destinoId: TIENDA, cantidad: 30 },
    ];
    expect(calcularStock(movimientos, BODEGA)).toBe(70);
    expect(calcularStock(movimientos, TIENDA)).toBe(30);
    expect(calcularStock(movimientos, OTRA)).toBe(0);
  });

  it("una devolución mueve stock de tienda de vuelta a bodega", () => {
    const movimientos = [
      { origenId: null, destinoId: BODEGA, cantidad: 100 },
      { origenId: BODEGA, destinoId: TIENDA, cantidad: 30 },
      { origenId: TIENDA, destinoId: BODEGA, cantidad: 10 },
    ];
    expect(calcularStock(movimientos, BODEGA)).toBe(80);
    expect(calcularStock(movimientos, TIENDA)).toBe(20);
  });

  it("un ajuste negativo (merma) resta del origen sin afectar ningún destino", () => {
    const movimientos = [
      { origenId: null, destinoId: BODEGA, cantidad: 100 },
      { origenId: BODEGA, destinoId: null, cantidad: 3 },
    ];
    expect(calcularStock(movimientos, BODEGA)).toBe(97);
  });

  it("un ajuste positivo (stock encontrado) suma al destino", () => {
    const movimientos = [
      { origenId: null, destinoId: BODEGA, cantidad: 100 },
      { origenId: null, destinoId: BODEGA, cantidad: 2 },
    ];
    expect(calcularStock(movimientos, BODEGA)).toBe(102);
  });

  it("deshacer un movimiento (movimiento inverso) vuelve el stock a su valor original", () => {
    const despacho = { origenId: BODEGA, destinoId: TIENDA, cantidad: 30 };
    const inverso = { origenId: TIENDA, destinoId: BODEGA, cantidad: 30 };
    const movimientos = [
      { origenId: null, destinoId: BODEGA, cantidad: 100 },
      despacho,
      inverso,
    ];
    expect(calcularStock(movimientos, BODEGA)).toBe(100);
    expect(calcularStock(movimientos, TIENDA)).toBe(0);
  });

  it("ignora movimientos que no involucran la ubicación consultada", () => {
    const movimientos = [
      { origenId: null, destinoId: OTRA, cantidad: 999 },
    ];
    expect(calcularStock(movimientos, BODEGA)).toBe(0);
  });
});
