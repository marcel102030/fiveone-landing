alter table public.rede_house_church
  add column if not exists presbitero_id_2 uuid references public.rede_presbitero(id) on delete set null;

create index if not exists rede_house_church_presbitero_2_idx on public.rede_house_church (presbitero_id_2);
