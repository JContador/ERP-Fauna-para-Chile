// =============================================================================
// Página para crear un pedido nuevo (/pedidos/nuevo).
// =============================================================================

import { crearPedido } from "@/modules/pedidos/actions";
import { listarProductosParaPedido } from "@/modules/pedidos/queries";
import { listarClientesActivos } from "@/modules/clientes/queries";
import { FormularioPedido } from "@/modules/pedidos/formulario-pedido";

export default async function PaginaNuevoPedido() {
  const [productos, clientes] = await Promise.all([
    listarProductosParaPedido(),
    listarClientesActivos(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl text-foreground">Nuevo pedido</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        El pedido se crea como borrador: puedes seguir editándolo hasta confirmarlo.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <FormularioPedido
          accion={crearPedido}
          productos={productos}
          clientes={clientes}
          textoBoton="Crear pedido"
        />
      </div>
    </div>
  );
}
