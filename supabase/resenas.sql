-- Tabla de reseñas de Boom Zapas. Pegala en Supabase → SQL Editor → Run.
create table if not exists public.resenas (
  id bigint generated always as identity primary key,
  nombre text not null,
  texto text not null,
  modelo text,
  puntaje smallint check (puntaje between 1 and 5),
  aprobada boolean not null default false,
  created_at timestamptz not null default now()
);

-- Sin políticas: sólo el servidor (clave de servicio) puede leer y escribir. El navegador nunca toca la tabla.
alter table public.resenas enable row level security;
