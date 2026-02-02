-- Seed de respostas do quiz para simular relatório (50 respostas)
-- 1) Substitua CHURCH_SLUG pelo slug da igreja desejada.
-- 2) Execute este script no banco.
-- 3) Para desfazer, rode o script supabase/seed_quiz_responses_undo.sql

with params as (
  select 'CHURCH_SLUG'::text as church_slug
),
church_ref as (
  select c.id as church_id
  from public.church c
  join params p on c.slug = p.church_slug
),
base as (
  select
    gs,
    case
      when gs <= 8 then 'pastor'
      when gs <= 15 then 'mestre'
      when gs <= 21 then 'evangelista'
      when gs <= 26 then 'apostolo'
      else 'profeta'
    end as top_dom,
    (random() * 18 + 5)::int as a,
    (random() * 18 + 5)::int as p,
    (random() * 18 + 5)::int as e,
    (random() * 18 + 5)::int as pa,
    (random() * 18 + 5)::int as m,
    (random() * 12 + 18)::int as bonus
  from generate_series(1, 50) gs
),
scores as (
  select
    gs,
    top_dom,
    case when top_dom = 'apostolo' then a + bonus else a end as apostolo,
    case when top_dom = 'profeta' then p + bonus else p end as profeta,
    case when top_dom = 'evangelista' then e + bonus else e end as evangelista,
    case when top_dom = 'pastor' then pa + bonus else pa end as pastor,
    case when top_dom = 'mestre' then m + bonus else m end as mestre
  from base
)
insert into public.quiz_response (
  church_id,
  person_name,
  person_email,
  person_phone,
  scores_json,
  top_dom,
  ties,
  created_at,
  submitted_at,
  user_agent,
  ip_hash
)
select
  church_ref.church_id,
  format('Seed Relatorio %s', scores.gs) as person_name,
  format('seed+%s@fiveone.local', scores.gs) as person_email,
  null::text as person_phone,
  jsonb_build_object(
    'apostolo', scores.apostolo,
    'profeta', scores.profeta,
    'evangelista', scores.evangelista,
    'pastor', scores.pastor,
    'mestre', scores.mestre
  ) as scores_json,
  scores.top_dom::public.fivefold_ministry as top_dom,
  ARRAY[]::public.fivefold_ministry[] as ties,
  now() - (random() * interval '25 days') as created_at,
  now() - (random() * interval '25 days') as submitted_at,
  'seed/quiz-report' as user_agent,
  null::text as ip_hash
from church_ref
join scores on true;
