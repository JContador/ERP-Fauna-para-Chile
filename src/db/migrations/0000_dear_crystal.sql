CREATE TYPE "public"."canal_pedido" AS ENUM('mayorista', 'concesion', 'web', 'feria');--> statement-breakpoint
CREATE TYPE "public"."estado_factura" AS ENUM('emitida', 'pagada_parcial', 'pagada', 'anulada');--> statement-breakpoint
CREATE TYPE "public"."estado_pedido" AS ENUM('borrador', 'confirmado', 'despachado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."referencia_movimiento" AS ENUM('pedido', 'conciliacion', 'manual');--> statement-breakpoint
CREATE TYPE "public"."rol_usuario" AS ENUM('admin', 'operador');--> statement-breakpoint
CREATE TYPE "public"."tipo_comercial" AS ENUM('mayorista', 'concesion', 'ambos');--> statement-breakpoint
CREATE TYPE "public"."tipo_conciliacion" AS ENUM('presencial', 'remota');--> statement-breakpoint
CREATE TYPE "public"."tipo_movimiento" AS ENUM('carga_inicial', 'despacho', 'venta', 'ajuste', 'devolucion', 'traspaso');--> statement-breakpoint
CREATE TYPE "public"."tipo_ubicacion" AS ENUM('bodega', 'punto_venta', 'feria');--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"tipo_comercial" "tipo_comercial" NOT NULL,
	"region" text,
	"condiciones" text,
	"estado" boolean DEFAULT true NOT NULL,
	"notas" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conciliaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	"tipo" "tipo_conciliacion" NOT NULL,
	"notas" text,
	"factura_id" uuid,
	"pedido_reposicion_id" uuid,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contactos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"cargo" text,
	"telefono" text,
	"correo" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conteos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conciliacion_id" uuid NOT NULL,
	"producto_id" uuid NOT NULL,
	"stock_teorico" integer NOT NULL,
	"stock_contado" integer
);
--> statement-breakpoint
CREATE TABLE "facturas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"folio_sii" text,
	"monto" numeric(12, 2) NOT NULL,
	"estado" "estado_factura" DEFAULT 'emitida' NOT NULL,
	"fecha_emision" timestamp with time zone DEFAULT now() NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lineas_pedido" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"producto_id" uuid NOT NULL,
	"cantidad" integer NOT NULL,
	"precio_unitario" numeric(12, 2)
);
--> statement-breakpoint
CREATE TABLE "movimientos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"producto_id" uuid NOT NULL,
	"origen_id" uuid,
	"destino_id" uuid,
	"cantidad" integer NOT NULL,
	"tipo" "tipo_movimiento" NOT NULL,
	"usuario_id" uuid,
	"referencia_tipo" "referencia_movimiento" DEFAULT 'manual' NOT NULL,
	"referencia_id" uuid,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pagos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"factura_id" uuid NOT NULL,
	"monto" numeric(12, 2) NOT NULL,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid,
	"canal" "canal_pedido" NOT NULL,
	"estado" "estado_pedido" DEFAULT 'borrador' NOT NULL,
	"guia_despacho" text,
	"fecha_pedido" timestamp with time zone DEFAULT now() NOT NULL,
	"fecha_despacho" timestamp with time zone,
	"notas" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL,
	"nombre" text NOT NULL,
	"categoria" text,
	"costo" numeric(12, 2),
	"precio" numeric(12, 2),
	"fotos" text[],
	"peso_gramos" integer,
	"dimensiones" text,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "productos_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "ubicaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"tipo" "tipo_ubicacion" NOT NULL,
	"cliente_id" uuid,
	"activa" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"correo" text NOT NULL,
	"rol" "rol_usuario" DEFAULT 'operador' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_correo_unique" UNIQUE("correo")
);
--> statement-breakpoint
ALTER TABLE "conciliaciones" ADD CONSTRAINT "conciliaciones_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conciliaciones" ADD CONSTRAINT "conciliaciones_pedido_reposicion_id_pedidos_id_fk" FOREIGN KEY ("pedido_reposicion_id") REFERENCES "public"."pedidos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contactos" ADD CONSTRAINT "contactos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conteos" ADD CONSTRAINT "conteos_conciliacion_id_conciliaciones_id_fk" FOREIGN KEY ("conciliacion_id") REFERENCES "public"."conciliaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conteos" ADD CONSTRAINT "conteos_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineas_pedido" ADD CONSTRAINT "lineas_pedido_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineas_pedido" ADD CONSTRAINT "lineas_pedido_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_origen_id_ubicaciones_id_fk" FOREIGN KEY ("origen_id") REFERENCES "public"."ubicaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_destino_id_ubicaciones_id_fk" FOREIGN KEY ("destino_id") REFERENCES "public"."ubicaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_factura_id_facturas_id_fk" FOREIGN KEY ("factura_id") REFERENCES "public"."facturas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ubicaciones" ADD CONSTRAINT "ubicaciones_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;