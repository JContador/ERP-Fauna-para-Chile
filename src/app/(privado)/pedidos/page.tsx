// =============================================================================
// Listado de pedidos (/pedidos).
// =============================================================================

import Link from "next/link";
import { listarPedidos } from "@/modules/pedidos/queries";
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

const NOMBRE_CANAL: Record<string, string> = {
  mayorista: "Mayorista",
  concesion: "Concesión",
  web: "Web",
  feria: "Feria",
};

const ESTADO_BADGE: Record<string, "outline" | "secondary" | "default" | "destructive"> = {
  borrador: "outline",
  confirmado: "secondary",
  despachado: "default",
  cancelado: "destructive",
};

const NOMBRE_ESTADO: Record<string, string> = {
  borrador: "Borrador",
  confirmado: "Confirmado",
  despachado: "Despachado",
  cancelado: "Cancelado",
};

function formatoCLP(valor: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(valor);
}

function formatoFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(fecha);
}

export default async function PaginaPedidos() {
  const lista = await listarPedidos();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Pedidos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lista.length === 0
              ? "Todavía no hay pedidos."
              : `${lista.length} pedido${lista.length === 1 ? "" : "s"} registrado${lista.length === 1 ? "" : "s"}.`}
          </p>
        </div>
        <Button render={<Link href="/pedidos/nuevo" />}>Nuevo pedido</Button>
      </div>

      {lista.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground">
                    {formatoFecha(p.fechaPedido)}
                  </TableCell>
                  <TableCell className="font-medium">{p.clienteNombre ?? "—"}</TableCell>
                  <TableCell>{NOMBRE_CANAL[p.canal] ?? p.canal}</TableCell>
                  <TableCell className="text-right">{formatoCLP(p.total)}</TableCell>
                  <TableCell>
                    <Badge variant={ESTADO_BADGE[p.estado] ?? "outline"}>
                      {NOMBRE_ESTADO[p.estado] ?? p.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/pedidos/${p.id}`} />}
                    >
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {lista.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Crea tu primer pedido con el botón «Nuevo pedido».
          </p>
        </div>
      )}
    </div>
  );
}
