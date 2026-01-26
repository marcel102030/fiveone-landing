-- Seed data for Rede de Igrejas nas Casas (safe to run multiple times).

insert into public.rede_member (
  id, full_name, email, phone, birthdate, gender, city, state, address, status, notes
) values
  ('11111111-1111-1111-1111-111111111111', 'Lucas Rocha', 'lucas.rocha@rede.local', '83999990001', '1986-04-18', 'M', 'Campina Grande', 'PB', 'Rua A, 120', 'ativo', 'seed'),
  ('22222222-2222-2222-2222-222222222222', 'Maria Souza', 'maria.souza@rede.local', '83999990002', '1990-09-02', 'F', 'Campina Grande', 'PB', 'Rua B, 45', 'ativo', 'seed'),
  ('33333333-3333-3333-3333-333333333333', 'Joao Pedro', 'joao.pedro@rede.local', '83999990003', '1988-12-11', 'M', 'Joao Pessoa', 'PB', 'Rua C, 78', 'ativo', 'seed')
on conflict (id) do nothing;

insert into public.rede_presbitero (
  id, member_id, since_date, status, notes
) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '2021-06-10', 'ativo', 'seed'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '2022-03-05', 'ativo', 'seed'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '2023-01-15', 'ativo', 'seed')
on conflict (member_id) do nothing;

insert into public.rede_house_church (
  id, name, city, neighborhood, address, meeting_day, meeting_time, capacity, status, presbitero_id, notes
) values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Casa Centro', 'Campina Grande', 'Centro', 'Rua Principal, 120', 'Quarta', '19:30', 20, 'ativa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'seed'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Casa Norte', 'Campina Grande', 'Catole', 'Rua Nova, 45', 'Terca', '20:00', 18, 'ativa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'seed'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Casa Sul', 'Joao Pessoa', 'Bancarios', 'Rua das Flores, 78', 'Quinta', '19:00', 16, 'em_formacao', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'seed')
on conflict (id) do nothing;

insert into public.rede_house_member (
  id, house_id, member_id, role, is_primary, joined_at
) values
  ('10101010-1010-1010-1010-101010101010', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'presbitero', true, '2021-07-01'),
  ('20202020-2020-2020-2020-202020202020', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'presbitero', true, '2022-04-01'),
  ('30303030-3030-3030-3030-303030303030', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'presbitero', true, '2023-02-01')
on conflict (house_id, member_id) do nothing;

insert into public.rede_member_gift (member_id, gift, source) values
  ('11111111-1111-1111-1111-111111111111', 'pastor', 'seed'),
  ('22222222-2222-2222-2222-222222222222', 'profeta', 'seed'),
  ('33333333-3333-3333-3333-333333333333', 'mestre', 'seed')
on conflict (member_id, gift) do nothing;

insert into public.rede_ministry_leader (
  id, member_id, ministry, region, status, notes
) values
  ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'pastor', 'Campina Grande', 'ativo', 'seed'),
  ('bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'profeta', 'Campina Grande', 'ativo', 'seed'),
  ('cccccccc-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'mestre', 'Joao Pessoa', 'ativo', 'seed')
on conflict (member_id, ministry) do nothing;

insert into public.rede_member_questionnaire (
  member_id,
  wants_preach_house,
  wants_preach_network,
  wants_bible_study,
  wants_open_house,
  wants_be_presbitero,
  wants_be_ministry_leader,
  wants_discipleship,
  wants_serve_worship,
  wants_serve_intercession,
  wants_serve_children,
  wants_serve_media,
  available_for_training,
  available_for_missions,
  notes
) values
  (
    '11111111-1111-1111-1111-111111111111',
    true, true, true, false, true, false, true, true, true, false, false, true, true,
    'seed'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    true, false, true, true, false, true, true, false, true, true, true, true, false,
    'seed'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    false, false, true, false, false, false, true, true, false, false, true, true, true,
    'seed'
  )
on conflict (member_id) do nothing;
