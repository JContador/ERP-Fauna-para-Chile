// =============================================================================
// Listado de movimientos recientes (/movimientos) — el libro de inventario.
// =============================================================================

import Link from "next/link";
import {
  listarMovimientosRecientes,
  listarIdsYaCorregidos,
} from "@/modules/inventario/movimientos/queries";
import { BotonDeshacer } from "@/modules/inventario/movimientos/boton-deshacer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const NOMBRE_TIPO: Record<string, string> = {
  carga_inicial: "Carga inicial",
  despacho: "Despacho",
  venta: "Venta",
  ajuste: "Ajuste",
  devolucion: "Devolución",
  traspaso: "Traspaso",
};

function formatoFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

export default async function PaginaMovimientos() {
  const [movimientos, idsCorregidos] = await Promise.all([
    listarMovimientosRecientes(),
    listarIdsYaCorregidos(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Movimientos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {movimientos.length === 0
              ? "Todavía no hay movimientos registrados."
              : `Últimos ${movimientos.length} movimientos.`}
          </p>
        </div>
        <Button render={<Link href="/movimientos/nuevo" />}>
          Registrar movimiento
        </Button>
      </div>

      {movimientos.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.map((m) => {
                const esCorreccion = m.referenciaTipo === "correccion";
                const yaFueDeshecho = idsCorregidos.has(m.id);
                return (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatoFecha(m.fecha)}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {m.productoSku}
                      </span>
                      <br />
                      {m.productoNombre}
                    </TableCell>
                    <TableCell>
                      {NOMBRE_TIPO[m.tipo] ?? m.tipo}
                      {esCorreccion && (
                        <Badge variant="outline" className="ml-2">
                          Corrección
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{m.origenNombre ?? "—"}</TableCell>
                    <TableCell>{m.destinoNombre ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium">{m.cantidad}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {m.usuarioNombre ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {!esCorreccion && !yaFueDeshecho && (
                        <BotonDeshacer movimientoId={m.id} />
                      )}
                      {yaFueDeshecho && (
                        <span className="text-xs text-muted-foreground">Deshecho</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {movimientos.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Registra tu primer movimiento (por ejemplo, la carga inicial de tu
            bodega) con el botón «Registrar movimiento».
          </p>
        </div>
      )}
    </div>
  );
}
