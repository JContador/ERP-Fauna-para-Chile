// =============================================================================
// Página principal (privada): panel de inicio con acceso a los módulos.
// =============================================================================

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const modulos = [
  {
    nombre: "Productos",
    descripcion: "Catálogo: SKU, precios, categorías y estado.",
    href: "/productos",
    disponible: true,
  },
  {
    nombre: "Inventario",
    descripcion: "Stock por ubicación y libro de movimientos.",
    disponible: false,
  },
  {
    nombre: "Clientes",
    descripcion: "Puntos de venta, contactos y notas.",
    disponible: false,
  },
  {
    nombre: "Pedidos",
    descripcion: "Pedidos y despachos por canal.",
    disponible: false,
  },
  {
    nombre: "Conciliaciones",
    descripcion: "Cierre mensual por conteo de cada tienda.",
    disponible: false,
  },
  {
    nombre: "Finanzas",
    descripcion: "Facturas, pagos y cuentas por cobrar.",
    disponible: false,
  },
];

export default function Home() {
  return (
    <div>
      <h1 className="font-heading text-2xl text-foreground">Panel principal</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Fase 1 en construcción: productos e inventario.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map((modulo) =>
          modulo.disponible && modulo.href ? (
            <Link key={modulo.nombre} href={modulo.href} className="group">
              <Card className="h-full transition-colors group-hover:border-neutral-400 dark:group-hover:border-neutral-600">
                <CardHeader>
                  <CardTitle>{modulo.nombre}</CardTitle>
                  <CardDescription>{modulo.descripcion}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ) : (
            <Card key={modulo.nombre} className="h-full opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {modulo.nombre}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                    Próximamente
                  </span>
                </CardTitle>
                <CardDescription>{modulo.descripcion}</CardDescription>
              </CardHeader>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
