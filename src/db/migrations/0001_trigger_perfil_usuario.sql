-- Custom SQL migration file, put your code below! --

-- =============================================================================
-- Disparador (trigger): crear el perfil en "usuarios" al registrarse un usuario
-- -----------------------------------------------------------------------------
-- Cuando Supabase Auth crea un usuario nuevo (en auth.users), esta funcion
-- inserta automaticamente su fila en public.usuarios con:
--   - el mismo id (para vincular ambas tablas)
--   - su correo
--   - nombre tomado de los metadatos si existe, o el correo como respaldo
--   - rol "operador" por defecto (el admin se asigna manualmente despues)
-- Asi, cada persona que inicia sesion tiene siempre su perfil y su rol.
-- =============================================================================

create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, correo, nombre, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre', new.email),
    'operador'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Se ejecuta despues de insertar una fila en auth.users.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.crear_perfil_usuario();
