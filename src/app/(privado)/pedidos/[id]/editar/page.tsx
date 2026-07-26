// =============================================================================
// Página para editar un pedido (/pedidos/[id]/editar). Solo disponible
// mientras el pedido está en estado "borrador".
// =============================================================================

import { notFound, redirect } from "next/navigation";
import {
  obtenerPedido,
  obtenerLineasPedido,
  listarProductosParaPedido,
} from "@/modules/pedidos/queries";
import { listarClientesActivos } from "@/modules/clientes/queries";
import { editarPedido } from "@/modules/pedidos/actions";
import { FormularioPedido } from "@/modules/pedidos/formulario-pedido";

export default async function PaginaEditarPedido({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedido = await obtenerPedido(id);
  if (!pedido) notFound();
  if (pedido.estado !== "borrador") redirect(`/pedidos/${id}`);

  const [lineas, productos, clientes] = await Promise.all([
    obtenerLineasPedido(id),
    listarProductosParaPedido(),
    listarClientesActivos(),
  ]);

  const accionConId = editarPedido.bind(null, pedido.id);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl text-foreground">Editar pedido</h1>
      <p className="mt-1 text-sm text-muted-foreground">Pedido en borrador.</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <FormularioPedido
          accion={accionConId}
          productos={productos}
          clientes={clientes}
          valores={{
            clienteId: pedido.clienteId,
            canal: pedido.canal,
            notas: pedido.notas,
            lineas: lineas.map((l) => ({
              productoId: l.productoId,
              cantidad: l.cantidad,
              precioUnitario: l.precioUnitario,
            })),
          }}
          textoBoton="Guardar cambios"
        />
      </div>
    </div>
  );
}
