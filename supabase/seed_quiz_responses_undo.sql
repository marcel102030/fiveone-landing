-- Desfazer seed de respostas do quiz
-- Substitua CHURCH_SLUG pelo slug da igreja usada no seed.

delete from public.quiz_response qr
using public.church c
where c.slug = 'CHURCH_SLUG'
  and qr.church_id = c.id
  and person_name like 'Seed Relatorio %'
  and user_agent = 'seed/quiz-report';
