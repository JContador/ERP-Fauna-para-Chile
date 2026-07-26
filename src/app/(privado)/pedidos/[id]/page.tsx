// =============================================================================
// Detalle de un pedido (/pedidos/[id]): líneas, total y acciones según estado.
// =============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  obtenerPedido,
  obtenerClienteDePedido,
  obtenerLineasPedido,
} from "@/modules/pedidos/queries";
import { confirmarPedido, cancelarPedido, despacharPedido } from "@/modules/pedidos/actions";
import { listarBodegasActivas } from "@/modules/inventario/ubicaciones/queries";
import { FormularioDespacho } from "@/modules/pedidos/formulario-despacho";
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
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(
    fecha,
  );
}

export default async function PaginaDetallePedido({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedido = await obtenerPedido(id);
  if (!pedido) notFound();

  const [cliente, lineas, bodegas] = await Promise.all([
    obtenerClienteDePedido(pedido.clienteId),
    obtenerLineasPedido(pedido.id),
    pedido.estado === "confirmado" ? listarBodegasActivas() : Promise.resolve([]),
  ]);

  const total = lineas.reduce(
    (acc, l) => acc + Number(l.precioUnitario ?? 0) * l.cantidad,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-foreground">
            Pedido de {cliente?.nombre ?? "venta sin cliente"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {NOMBRE_CANAL[pedido.canal] ?? pedido.canal} · {formatoFecha(pedido.fechaPedido)}
          </p>
        </div>
        <Badge variant={ESTADO_BADGE[pedido.estado] ?? "outline"}>
          {NOMBRE_ESTADO[pedido.estado] ?? pedido.estado}
        </Badge>
      </div>

      {pedido.notas && (
        <p className="mt-4 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
          {pedido.notas}
        </p>
      )}

      {pedido.estado === "despachado" && (
        <p className="mt-4 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
          Guía de despacho <span className="font-medium text-foreground">{pedido.guiaDespacho}</span>
          {pedido.fechaDespacho && <> · despachado el {formatoFecha(pedido.fechaDespacho)}</>}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio unitario</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineas.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">
                  {l.productoSku} — {l.productoNombre ?? "—"}
                </TableCell>
                <TableCell className="text-right">{l.cantidad}</TableCell>
                <TableCell className="text-right">
                  {formatoCLP(Number(l.precioUnitario ?? 0))}
                </TableCell>
                <TableCell className="text-right">
                  {formatoCLP(Number(l.precioUnitario ?? 0) * l.cantidad)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t border-border p-3 text-right text-sm">
          Total: <span className="font-medium text-foreground">{formatoCLP(total)}</span>
        </div>
      </div>

      {pedido.estado === "confirmado" && (
        <div className="mt-6">
          <FormularioDespacho
            accion={despacharPedido.bind(null, pedido.id)}
            bodegas={bodegas}
          />
          {bodegas.length === 0 && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              No hay ninguna ubicación activa de tipo "bodega". Crea una en
              Ubicaciones antes de despachar.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {pedido.estado === "borrador" && (
          <>
            <Button render={<Link href={`/pedidos/${pedido.id}/editar`} />}>
              Editar
            </Button>
            <form action={confirmarPedido.bind(null, pedido.id)}>
              <Button type="submit" variant="outline">
                Confirmar pedido
              </Button>
            </form>
          </>
        )}
        {(pedido.estado === "borrador" || pedido.estado === "confirmado") && (
          <form action={cancelarPedido.bind(null, pedido.id)}>
            <Button type="submit" variant="ghost">
              Cancelar pedido
            </Button>
          </form>
        )}
        <Button variant="outline" render={<Link href="/pedidos" />}>
          Volver al listado
        </Button>
      </div>
    </div>
  );
}
