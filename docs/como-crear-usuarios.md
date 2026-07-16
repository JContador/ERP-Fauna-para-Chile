# Cómo crear usuarios y asignar el rol admin

Guía en simple para dar acceso al sistema a las personas del equipo. Por ahora
(Fase 0) los usuarios se crean desde el panel de Supabase. Más adelante se podrá
hacer desde el propio ERP.

## Paso 1 — Crear el usuario en Supabase

1. Entra al panel de Supabase y elige el proyecto correcto:
   - **fauna-staging** para pruebas.
   - **fauna-produccion** para el sistema real (cuando esté desplegado).
2. En el menú lateral, ve a **Authentication** (ícono de candado) → **Users**.
3. Haz clic en **"Add user"** → **"Create new user"**.
4. Escribe el **correo** y una **contraseña** para esa persona.
5. Marca la opción **"Auto Confirm User"** (para que pueda entrar de inmediato
   sin tener que confirmar por correo).
6. Clic en **"Create user"**.

Apenas se crea, el sistema le arma automáticamente su perfil con rol **"operador"**.

## Paso 2 — (Opcional) Convertir a un usuario en administrador

Por seguridad, todos parten como "operador". Para dejar a alguien como
administrador:

1. En el panel de Supabase, ve a **SQL Editor** (ícono de terminal `>_`).
2. Pega esta consulta, cambiando el correo por el de la persona:

   ```sql
   update usuarios
   set rol = 'admin'
   where correo = 'correo-de-la-persona@ejemplo.com';
   ```

3. Haz clic en **"Run"**.

Para ver todos los usuarios y sus roles:

```sql
select correo, nombre, rol, activo from usuarios order by creado_en;
```

## Paso 3 — Entrar al sistema

La persona ya puede iniciar sesión en la app con su correo y contraseña.

---

**Nota de seguridad:** las contraseñas las define quien crea el usuario en
Supabase. Se recomienda usar contraseñas seguras y que cada persona la cambie
apenas entre (esa función de "cambiar contraseña" se agregará más adelante).
