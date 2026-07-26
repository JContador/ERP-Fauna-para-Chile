// =============================================================================
// Página para editar un cliente (/clientes/[id]/editar), con su lista de
// contactos.
// =============================================================================

import { notFound } from "next/navigation";
import { obtenerCliente, listarContactos } from "@/modules/clientes/queries";
import { editarCliente, eliminarContacto } from "@/modules/clientes/actions";
import { FormularioCliente } from "@/modules/clientes/formulario-cliente";
import { FormularioContacto } from "@/modules/clientes/formulario-contacto";
import { Button } from "@/components/ui/button";

export default async function PaginaEditarCliente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cliente, contactos] = await Promise.all([
    obtenerCliente(id),
    listarContactos(id),
  ]);
  if (!cliente) notFound();

  const accionConId = editarCliente.bind(null, cliente.id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl text-foreground">Editar cliente</h1>
      <p className="mt-1 text-sm text-muted-foreground">{cliente.nombre}</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <FormularioCliente
          accion={accionConId}
          valores={cliente}
          textoBoton="Guardar cambios"
        />
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-lg text-foreground">Contactos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Personas de contacto en {cliente.nombre}.
        </p>

        {contactos.length > 0 && (
          <ul className="mt-4 space-y-2">
            {contactos.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div className="text-sm">
                  <span className="font-medium text-foreground">{c.nombre}</span>
                  {c.cargo && (
                    <span className="text-muted-foreground"> · {c.cargo}</span>
                  )}
                  {(c.telefono || c.correo) && (
                    <div className="text-muted-foreground">
                      {[c.telefono, c.correo].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
                <form action={eliminarContacto.bind(null, cliente.id, c.id)}>
                  <Button type="submit" variant="ghost" size="sm">
                    Eliminar
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <FormularioContacto clienteId={cliente.id} />
        </div>
      </div>
    </div>
  );
}
