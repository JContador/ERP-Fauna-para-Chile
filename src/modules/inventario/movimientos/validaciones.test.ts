import { describe, it, expect } from "vitest";
import {
  validarCantidad,
  validarCombinacionUbicaciones,
  crearMovimientoInverso,
} from "./validaciones";

const BODEGA = "bodega-1";
const TIENDA = "tienda-1";

describe("validarCantidad", () => {
  it("acepta enteros positivos", () => {
    expect(validarCantidad(1)).toEqual({ valido: true });
    expect(validarCantidad(500)).toEqual({ valido: true });
  });

  it("rechaza cero, negativos y decimales", () => {
    expect(validarCantidad(0).valido).toBe(false);
    expect(validarCantidad(-5).valido).toBe(false);
    expect(validarCantidad(2.5).valido).toBe(false);
  });
});

describe("validarCombinacionUbicaciones", () => {
  it("carga_inicial: exige destino y prohíbe origen", () => {
    expect(validarCombinacionUbicaciones("carga_inicial", null, BODEGA).valido).toBe(true);
    expect(validarCombinacionUbicaciones("carga_inicial", null, null).valido).toBe(false);
    expect(validarCombinacionUbicaciones("carga_inicial", BODEGA, BODEGA).valido).toBe(false);
  });

  it("despacho: exige origen y destino distintos", () => {
    expect(validarCombinacionUbicaciones("despacho", BODEGA, TIENDA).valido).toBe(true);
    expect(validarCombinacionUbicaciones("despacho", BODEGA, null).valido).toBe(false);
    expect(validarCombinacionUbicaciones("despacho", null, TIENDA).valido).toBe(false);
    expect(validarCombinacionUbicaciones("despacho", BODEGA, BODEGA).valido).toBe(false);
  });

  it("venta: exige origen y prohíbe destino", () => {
    expect(validarCombinacionUbicaciones("venta", TIENDA, null).valido).toBe(true);
    expect(validarCombinacionUbicaciones("venta", null, null).valido).toBe(false);
    expect(validarCombinacionUbicaciones("venta", TIENDA, BODEGA).valido).toBe(false);
  });

  it("devolucion: exige origen y destino distintos", () => {
    expect(validarCombinacionUbicaciones("devolucion", TIENDA, BODEGA).valido).toBe(true);
    expect(validarCombinacionUbicaciones("devolucion", TIENDA, null).valido).toBe(false);
  });

  it("traspaso: exige origen y destino distintos", () => {
    expect(validarCombinacionUbicaciones("traspaso", BODEGA, TIENDA).valido).toBe(true);
    expect(validarCombinacionUbicaciones("traspaso", BODEGA, BODEGA).valido).toBe(false);
  });

  it("ajuste: exige exactamente una ubicación (origen O destino, no ambas ni ninguna)", () => {
    expect(validarCombinacionUbicaciones("ajuste", BODEGA, null).valido).toBe(true);
    expect(validarCombinacionUbicaciones("ajuste", null, BODEGA).valido).toBe(true);
    expect(validarCombinacionUbicaciones("ajuste", null, null).valido).toBe(false);
    expect(validarCombinacionUbicaciones("ajuste", BODEGA, TIENDA).valido).toBe(false);
  });
});

describe("crearMovimientoInverso", () => {
  it("invierte origen y destino, mantiene producto y cantidad", () => {
    const original = {
      id: "mov-1",
      productoId: "prod-1",
      origenId: BODEGA,
      destinoId: TIENDA,
      cantidad: 30,
    };
    expect(crearMovimientoInverso(original)).toEqual({
      productoId: "prod-1",
      origenId: TIENDA,
      destinoId: BODEGA,
      cantidad: 30,
      tipo: "ajuste",
      referenciaTipo: "correccion",
      referenciaId: "mov-1",
    });
  });

  it("una carga inicial (sin origen) se deshace como una salida de bodega", () => {
    const original = {
      id: "mov-2",
      productoId: "prod-1",
      origenId: null,
      destinoId: BODEGA,
      cantidad: 100,
    };
    const inverso = crearMovimientoInverso(original);
    expect(inverso.origenId).toBe(BODEGA);
    expect(inverso.destinoId).toBeNull();
    expect(inverso.referenciaId).toBe("mov-2");
  });

  it("una venta (sin destino) se deshace como una entrada a la tienda", () => {
    const original = {
      id: "mov-3",
      productoId: "prod-1",
      origenId: TIENDA,
      destinoId: null,
      cantidad: 5,
    };
    const inverso = crearMovimientoInverso(original);
    expect(inverso.origenId).toBeNull();
    expect(inverso.destinoId).toBe(TIENDA);
  });
});
