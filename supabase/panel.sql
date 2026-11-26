-- ════════════════════════════════════════════════════════════════════
-- Boom Zapas · panel conectado a Supabase
-- Pegar completo en Supabase → SQL Editor → Run. Se puede volver a correr sin problema.
-- Requiere haber corrido antes supabase/pedidos-web.sql (tabla de pedidos y numeración).
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Quiénes pueden entrar al panel ───────────────────────────────
-- Sólo los mails de esta lista ven y tocan los datos, aunque alguien se cree una cuenta.
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
revoke all on table public.admins from anon, authenticated;

insert into public.admins (email) values ('alvarodavicino64@gmail.com') on conflict do nothing;
-- Para sumar al dueño de la tienda (cambiá el mail y corré sólo esta línea):
-- insert into public.admins (email) values ('mail-del-cliente@gmail.com') on conflict do nothing;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select coalesce(auth.role() = 'authenticated', false)
     and exists (select 1 from public.admins a where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$fn$;
revoke all on function public.es_admin() from public;
grant execute on function public.es_admin() to anon, authenticated;

-- ── 2. Pedidos: estado y datos internos ─────────────────────────────
alter table public.pedidos add column if not exists estado text not null default 'pendiente';
alter table public.pedidos add column if not exists nota_interna text;
alter table public.pedidos add column if not exists seguimiento text;
alter table public.pedidos add column if not exists descuento integer;
alter table public.pedidos add column if not exists stock_descontado boolean not null default false;
alter table public.pedidos add column if not exists actualizado_en timestamptz not null default now();
-- la función que registra pedidos corre como dueña de la tabla: sin "force" no la frena la seguridad por filas
alter table public.pedidos no force row level security;

grant select, insert, update, delete on table public.pedidos to authenticated;
grant usage on sequence public.pedidos_numero_seq to authenticated;
drop policy if exists pedidos_admin on public.pedidos;
create policy pedidos_admin on public.pedidos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- ── 3. Caja (gastos e ingresos) ──────────────────────────────────────
create table if not exists public.caja (
  id        text primary key default gen_random_uuid()::text,
  fecha     timestamptz not null default now(),
  tipo      text not null check (tipo in ('gasto', 'ingreso')),
  categoria text not null,
  concepto  text not null default '',
  monto     integer not null check (monto >= 0),
  medio     text not null default '',
  compra    jsonb,
  creado_en timestamptz not null default now()
);
alter table public.caja enable row level security;
revoke all on table public.caja from anon;
grant select, insert, update, delete on table public.caja to authenticated;
drop policy if exists caja_admin on public.caja;
create policy caja_admin on public.caja for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- ── 4. Costo de cada modelo ──────────────────────────────────────────
create table if not exists public.costos (
  producto_id integer primary key,
  costo       integer not null check (costo > 0)
);
alter table public.costos enable row level security;
revoke all on table public.costos from anon;
grant select, insert, update, delete on table public.costos to authenticated;
drop policy if exists costos_admin on public.costos;
create policy costos_admin on public.costos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- ── 5. Catálogo: cambios del panel (precio, stock, ocultar…) y modelos nuevos ──
-- La tienda los lee para mostrar los precios y el stock al día; sólo el panel los cambia.
create table if not exists public.catalogo_ajustes (
  producto_id    integer primary key,
  datos          jsonb not null default '{}'::jsonb,
  actualizado_en timestamptz not null default now()
);
create table if not exists public.productos_propios (
  id        integer primary key,
  datos     jsonb not null,
  creado_en timestamptz not null default now()
);
alter table public.catalogo_ajustes enable row level security;
alter table public.productos_propios enable row level security;
grant select on table public.catalogo_ajustes, public.productos_propios to anon, authenticated;
grant insert, update, delete on table public.catalogo_ajustes, public.productos_propios to authenticated;
drop policy if exists ajustes_leer on public.catalogo_ajustes;
drop policy if exists ajustes_admin on public.catalogo_ajustes;
drop policy if exists propios_leer on public.productos_propios;
drop policy if exists propios_admin on public.productos_propios;
create policy ajustes_leer on public.catalogo_ajustes for select to anon, authenticated using (true);
create policy ajustes_admin on public.catalogo_ajustes for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy propios_leer on public.productos_propios for select to anon, authenticated using (true);
create policy propios_admin on public.productos_propios for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- ── 6. Reseñas de clientes ───────────────────────────────────────────
create table if not exists public.resenas_web (
  id          uuid primary key default gen_random_uuid(),
  creado_en   timestamptz not null default now(),
  usuario     text not null,
  texto       text not null,
  modelo      text,
  puntaje     smallint check (puntaje between 1 and 5),
  aprobada    boolean not null default false,
  origen_hash text
);
alter table public.resenas_web enable row level security;
revoke all on table public.resenas_web from anon, authenticated;
-- la tienda sólo ve las aprobadas, y sin datos internos
grant select (id, creado_en, usuario, texto, modelo, puntaje, aprobada) on table public.resenas_web to anon, authenticated;
grant insert, update, delete on table public.resenas_web to authenticated;
drop policy if exists resenas_publicas on public.resenas_web;
drop policy if exists resenas_admin on public.resenas_web;
create policy resenas_publicas on public.resenas_web for select to anon, authenticated using (aprobada or public.es_admin());
create policy resenas_admin on public.resenas_web for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- los clientes dejan su reseña por acá (queda para revisar), con controles y freno a envíos masivos
create or replace function public.enviar_resena(r jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  nuevo uuid;
  ip text;
  origen text;
  recientes integer;
begin
  if r is null or jsonb_typeof(r) <> 'object' then raise exception 'reseña inválida'; end if;
  if length(trim(coalesce(r->>'usuario', ''))) not between 2 and 60 then raise exception 'falta el nombre'; end if;
  if length(trim(coalesce(r->>'texto', ''))) not between 10 and 600 then raise exception 'la reseña es muy corta o muy larga'; end if;
  if coalesce(r->>'puntaje', '') not in ('1', '2', '3', '4', '5') then raise exception 'puntaje inválido'; end if;
  ip := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1);
  origen := md5('bz-r-' || ip);
  select count(*) into recientes from public.resenas_web where origen_hash = origen and creado_en > now() - interval '1 hour';
  if recientes >= 3 then raise exception 'ya recibimos tus reseñas, gracias'; end if;
  select count(*) into recientes from public.resenas_web where creado_en > now() - interval '1 hour' and not aprobada;
  if recientes >= 40 then raise exception 'probá de nuevo en un rato'; end if;
  insert into public.resenas_web (usuario, texto, modelo, puntaje, origen_hash)
  values (left(trim(r->>'usuario'), 60), left(trim(r->>'texto'), 600), nullif(left(trim(coalesce(r->>'modelo', '')), 80), ''),
          (r->>'puntaje')::smallint, origen)
  returning id into nuevo;
  return nuevo;
end;
$fn$;
revoke all on function public.enviar_resena(jsonb) from public;
grant execute on function public.enviar_resena(jsonb) to anon, authenticated;

notify pgrst, 'reload schema';
