// =============================================================================
// Listado de clientes (/clientes).
// =============================================================================

import Link from "next/link";
import { listarClientes } from "@/modules/clientes/queries";
import { cambiarEstadoCliente } from "@/modules/clientes/actions";
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
  mayorista: "Mayorista",
  concesion: "Concesión",
  ambos: "Ambos",
};

export default async function PaginaClientes() {
  const lista = await listarClientes();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lista.length === 0
              ? "Todavía no hay clientes."
              : `${lista.length} cliente${lista.length === 1 ? "" : "s"} registrado${lista.length === 1 ? "" : "s"}.`}
          </p>
        </div>
        <Button render={<Link href="/clientes/nuevo" />}>Nuevo cliente</Button>
      </div>

      {lista.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Tipo comercial</TableHead>
                <TableHead>Región</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((c) => (
                <TableRow key={c.id} className={c.estado ? "" : "opacity-60"}>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell className="font-mono text-xs">{c.rut}</TableCell>
                  <TableCell>{NOMBRE_TIPO[c.tipoComercial] ?? c.tipoComercial}</TableCell>
                  <TableCell className="text-muted-foreground">{c.region ?? "—"}</TableCell>
                  <TableCell>
                    {c.estado ? (
                      <Badge variant="secondary">Activo</Badge>
                    ) : (
                      <Badge variant="outline">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/clientes/${c.id}/editar`} />}
                      >
                        Editar
                      </Button>
                      <form action={cambiarEstadoCliente.bind(null, c.id, !c.estado)}>
                        <Button type="submit" variant="ghost" size="sm">
                          {c.estado ? "Desactivar" : "Activar"}
                        </Button>
                      </form>
                    </div>
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
            Agrega tu primer cliente con el botón «Nuevo cliente».
          </p>
        </div>
      )}
    </div>
  );
}
