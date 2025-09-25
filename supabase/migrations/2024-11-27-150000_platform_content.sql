create table if not exists platform_ministry (
  id text primary key,
  title text not null,
  tagline text,
  icon text,
  focus_color text,
  gradient text,
  created_at timestamptz not null default now()
);

create table if not exists platform_module (
  id text primary key,
  ministry_id text not null references platform_ministry(id) on delete cascade,
  order_index integer not null default 0,
  title text not null,
  status text not null default 'draft',
  description text,
  highlight text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_module_ministry_idx on platform_module(ministry_id, order_index);

create table if not exists platform_lesson (
  id text primary key,
  module_id text not null references platform_module(id) on delete cascade,
  order_index integer not null default 0,
  title text not null,
  subtitle text,
  description text,
  content_type text not null default 'VIDEO',
  source_type text not null default 'YOUTUBE',
  video_url text,
  external_url text,
  embed_code text,
  material_file jsonb,
  banner_continue jsonb,
  banner_player jsonb,
  subject_id text,
  subject_name text,
  subject_type text,
  instructor text,
  duration_minutes numeric,
  thumbnail_url text,
  status text not null default 'draft',
  release_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_lesson_module_idx on platform_lesson(module_id, order_index);

insert into platform_ministry (id, title, tagline, icon, focus_color, gradient)
values
  ('APOSTOLO', 'Apóstolo', 'Governança e envio apostólico.', '/assets/icons/apostolo.svg', '#60a5fa', 'linear-gradient(135deg, #0f172a, #1d4ed8)'),
  ('PROFETA', 'Profeta', 'Discernimento e voz profética.', '/assets/icons/profeta.svg', '#f472b6', 'linear-gradient(135deg, #0f172a, #be185d)'),
  ('EVANGELISTA', 'Evangelista', 'Anúncio do evangelho com paixão.', '/assets/icons/evangelista.svg', '#facc15', 'linear-gradient(135deg, #0f172a, #ca8a04)'),
  ('PASTOR', 'Pastor', 'Cuidado e discipulado pastoral.', '/assets/icons/pastor.svg', '#4ade80', 'linear-gradient(135deg, #0f172a, #15803d)'),
  ('MESTRE', 'Mestre', 'Fundamentos e ensino bíblico.', '/assets/icons/mestre.svg', '#38bdf8', 'linear-gradient(135deg, #0f172a, #0369a1)')
on conflict (id) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  icon = excluded.icon,
  focus_color = excluded.focus_color,
  gradient = excluded.gradient;

insert into platform_module (id, ministry_id, order_index, title, status)
select
  format('%s-mod-%02s', m.id, i) as id,
  m.id as ministry_id,
  (i::int - 1) as order_index,
  format('Módulo %02s', i::int) as title,
  case when i = '01' then 'published' else 'draft' end as status
from platform_ministry m,
  generate_series(1, 8, 1) as g(i)
on conflict (id) do update set
  order_index = excluded.order_index,
  title = excluded.title,
  status = excluded.status,
  updated_at = now();

insert into platform_lesson (
  id,
  module_id,
  order_index,
  title,
  subtitle,
  content_type,
  source_type,
  video_url,
  subject_id,
  subject_name,
  subject_type,
  instructor,
  thumbnail_url,
  status,
  is_active
)
select
  l.video_id,
  'MESTRE-mod-01' as module_id,
  row_number() over (order by l.video_id) - 1,
  l.title,
  null,
  'VIDEO',
  case when l.url ilike '%vimeo%' then 'VIMEO' else 'YOUTUBE' end,
  l.url,
  l.subject_id,
  l.subject_name,
  l.subject_type,
  l.subject_teacher,
  l.thumbnail,
  'published',
  true
from (values
  ('mestre-01', 'A Palavra de Deus', 'https://player.vimeo.com/video/1100734000', 'biblia', 'Conheça a Sua Bíblia', 'Formação T', 'Rodolfo', '/assets/images/Introducao_historia_igreja.png'),
  ('mestre-02', 'Mestres no Antigo Testamento', 'https://www.youtube.com/embed/XQEGw923yD0', 'fundamentos', 'Fundamentos do Ministério de Mestre', 'Formação M', 'Guh', null),
  ('mestre-03', 'Somos todos sacerdotes e os 5 Ministérios', 'https://www.youtube.com/embed/4KatysePW3U?start=2148', 'ministerios', 'Introdução aos 5 Ministérios', 'Formação M', 'Marcelo', null),
  ('mestre-04', 'Introdução à História da Igreja', 'https://www.youtube.com/embed/4KatysePW3U?start=2148', 'historia', 'História da Igreja I', 'Formação T', 'Suenia', null)
) as l(video_id, title, url, subject_id, subject_name, subject_type, subject_teacher, thumbnail)
on conflict (id) do nothing;
