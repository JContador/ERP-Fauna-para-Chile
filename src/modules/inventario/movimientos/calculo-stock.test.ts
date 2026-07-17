import { describe, it, expect } from "vitest";
import {
  calcularStock,
  calcularStockPorProductoYUbicacion,
  claveStock,
} from "./calculo-stock";

const BODEGA = "bodega-1";
const TIENDA = "tienda-1";
const OTRA = "otra-ubicacion";
const PROD_A = "producto-a";
const PROD_B = "producto-b";

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

describe("calcularStockPorProductoYUbicacion", () => {
  it("devuelve un mapa vacío sin movimientos", () => {
    expect(calcularStockPorProductoYUbicacion([]).size).toBe(0);
  });

  it("calcula el stock de varios productos y ubicaciones en una sola pasada", () => {
    const movimientos = [
      { productoId: PROD_A, origenId: null, destinoId: BODEGA, cantidad: 100 },
      { productoId: PROD_A, origenId: BODEGA, destinoId: TIENDA, cantidad: 30 },
      { productoId: PROD_B, origenId: null, destinoId: BODEGA, cantidad: 50 },
    ];
    const stock = calcularStockPorProductoYUbicacion(movimientos);

    expect(stock.get(claveStock(PROD_A, BODEGA))).toBe(70);
    expect(stock.get(claveStock(PROD_A, TIENDA))).toBe(30);
    expect(stock.get(claveStock(PROD_B, BODEGA))).toBe(50);
    // Producto B nunca se movió a la tienda: no debería tener una entrada.
    expect(stock.has(claveStock(PROD_B, TIENDA))).toBe(false);
  });

  it("no mezcla el stock de un producto con el de otro en la misma ubicación", () => {
    const movimientos = [
      { productoId: PROD_A, origenId: null, destinoId: BODEGA, cantidad: 10 },
      { productoId: PROD_B, origenId: null, destinoId: BODEGA, cantidad: 999 },
    ];
    const stock = calcularStockPorProductoYUbicacion(movimientos);
    expect(stock.get(claveStock(PROD_A, BODEGA))).toBe(10);
    expect(stock.get(claveStock(PROD_B, BODEGA))).toBe(999);
  });

  it("da el mismo resultado que calcularStock() para una combinación individual", () => {
    const movimientosStock = [
      { origenId: null, destinoId: BODEGA, cantidad: 100 },
      { origenId: BODEGA, destinoId: TIENDA, cantidad: 30 },
      { origenId: TIENDA, destinoId: BODEGA, cantidad: 5 },
    ];
    const movimientosConProducto = movimientosStock.map((m) => ({
      ...m,
      productoId: PROD_A,
    }));

    const stockIndividual = calcularStock(movimientosStock, TIENDA);
    const stockMatriz = calcularStockPorProductoYUbicacion(movimientosConProducto).get(
      claveStock(PROD_A, TIENDA),
    );

    expect(stockMatriz).toBe(stockIndividual);
  });
});
