// =============================================================================
// Listado de ubicaciones (/ubicaciones).
// =============================================================================

import Link from "next/link";
import { listarUbicaciones } from "@/modules/inventario/ubicaciones/queries";
import { cambiarEstadoUbicacion } from "@/modules/inventario/ubicaciones/actions";
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
  bodega: "Bodega",
  punto_venta: "Punto de venta",
  feria: "Feria",
};

export default async function PaginaUbicaciones() {
  const lista = await listarUbicaciones();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Ubicaciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lista.length === 0
              ? "Todavía no hay ubicaciones."
              : `${lista.length} ubicación${lista.length === 1 ? "" : "es"} registrada${lista.length === 1 ? "" : "s"}.`}
          </p>
        </div>
        <Button render={<Link href="/ubicaciones/nueva" />}>
          Nueva ubicación
        </Button>
      </div>

      {lista.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((u) => (
                <TableRow key={u.id} className={u.activa ? "" : "opacity-60"}>
                  <TableCell className="font-medium">{u.nombre}</TableCell>
                  <TableCell>{NOMBRE_TIPO[u.tipo] ?? u.tipo}</TableCell>
                  <TableCell>
                    {u.activa ? (
                      <Badge variant="secondary">Activa</Badge>
                    ) : (
                      <Badge variant="outline">Inactiva</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/ubicaciones/${u.id}/editar`} />}
                      >
                        Editar
                      </Button>
                      <form
                        action={cambiarEstadoUbicacion.bind(null, u.id, !u.activa)}
                      >
                        <Button type="submit" variant="ghost" size="sm">
                          {u.activa ? "Desactivar" : "Activar"}
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
            Empieza creando tu «Bodega Central» con el botón «Nueva ubicación».
          </p>
        </div>
      )}
    </div>
  );
}
