-- I8 — Move as 100 afirmações do teste para o banco (fonte da verdade editável).
-- Mantém os ids 1-100 nas mesmas faixas por dom (apóstolo 1-20, profeta 21-40,
-- evangelista 41-60, pastor 61-80, mestre 81-100), então o scoring por faixa no
-- servidor (quiz-store) continua válido. O front busca via /api/quiz-statements
-- com fallback para data/questions.ts.

CREATE TABLE IF NOT EXISTS public.quiz_statement (
  id                 INTEGER PRIMARY KEY,
  category           TEXT NOT NULL CHECK (category IN ('apostolo','profeta','evangelista','pastor','mestre')),
  text               TEXT NOT NULL,
  instrument_version INTEGER NOT NULL DEFAULT 2,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quiz_statement ENABLE ROW LEVEL SECURITY;

-- Servido via endpoint com service_role; leitura direta restrita a admin.
DROP POLICY IF EXISTS quiz_statement_select_admin ON public.quiz_statement;
CREATE POLICY quiz_statement_select_admin ON public.quiz_statement
  FOR SELECT TO authenticated
  USING ((SELECT public.is_platform_admin()));

CREATE INDEX IF NOT EXISTS idx_quiz_statement_active
  ON public.quiz_statement (category, id)
  WHERE is_active = true;

-- Marca qual versão do instrumento gerou cada resultado (comparabilidade histórica)
ALTER TABLE public.quiz_response
  ADD COLUMN IF NOT EXISTS instrument_version INTEGER;

-- Seed (instrument_version 2 = contrabalanceado + 1º passe de reescrita).
-- Idempotente: re-executar atualiza texto/categoria.
INSERT INTO public.quiz_statement (id, category, text) VALUES
  (1, 'apostolo', 'Tenho facilidade em visualizar caminhos estratégicos para o avanço de projetos que envolvem pessoas e transformação.'),
  (2, 'apostolo', 'Sinto-me motivado a iniciar coisas novas, especialmente em ambientes onde poucos estão dispostos a começar.'),
  (3, 'apostolo', 'Fico inquieto quando percebo que um grupo, igreja ou projeto está estagnado e sem crescimento.'),
  (4, 'apostolo', 'Tenho facilidade em liderar com visão de longo prazo, inspirando outros a se unirem em um propósito maior.'),
  (5, 'apostolo', 'Sinto-me confortável ao trabalhar em contextos novos, incertos ou desafiadores, onde é preciso abrir caminho para outros.'),
  (6, 'apostolo', 'Tenho prazer em estabelecer fundamentos estratégicos para que outros ministérios ou projetos possam edificar a partir deles.'),
  (7, 'apostolo', 'Gosto de conectar pessoas com habilidades diferentes para formar redes colaborativas que impulsionem um objetivo comum.'),
  (8, 'apostolo', 'Sinto alegria ao formar e capacitar líderes que possam continuar uma missão ou projeto com autonomia.'),
  (9, 'apostolo', 'Tenho facilidade em planejar, organizar e estruturar iniciativas que envolvem crescimento e desenvolvimento coletivo.'),
  (10, 'apostolo', 'Costumo perceber rapidamente os pontos que precisam ser ajustados para que um grupo ou projeto alcance seu potencial máximo.'),
  (11, 'apostolo', 'Sinto satisfação em superar resistências e barreiras ao estabelecer algo novo em um território ainda não explorado.'),
  (12, 'apostolo', 'Tenho facilidade em delegar responsabilidades estratégicas e confiar que outros executarão com excelência.'),
  (13, 'apostolo', 'Me alegra construir pontes entre lideranças de diferentes contextos para unir esforços em um objetivo comum.'),
  (14, 'apostolo', 'Sinto que fui feito para navegar em situações de alta pressão e ambiguidade, tomando decisões que impulsionam o avanço coletivo.'),
  (15, 'apostolo', 'Tenho facilidade em enxergar como diferentes setores ou áreas podem trabalhar de forma alinhada.'),
  (16, 'apostolo', 'Valorizo a construção de bases sólidas que possam ser multiplicadas de forma consistente por outras pessoas.'),
  (17, 'apostolo', 'Me preocupo em garantir que as ações que estamos realizando hoje tenham impacto duradouro e sejam sustentáveis no futuro.'),
  (18, 'apostolo', 'Tenho facilidade em antecipar cenários futuros e gosto de pensar estrategicamente para enfrentá-los.'),
  (19, 'apostolo', 'Sinto-me chamado a enviar e comissionar pessoas para iniciar novas frentes e expandir a obra.'),
  (20, 'apostolo', 'Tenho facilidade em agir com coragem e assumir riscos calculados para abrir novos caminhos quando necessário.'),
  (21, 'profeta', 'Tenho uma percepção rápida e quase instintiva quando algo está espiritualmente errado, mesmo sem fatos concretos.'),
  (22, 'profeta', 'Sinto-me incomodado quando vejo hipocrisia, superficialidade ou incoerência na vida espiritual das pessoas.'),
  (23, 'profeta', 'Sinto uma inquietude interior quando uma comunidade de fé está acomodada e perdendo sua chama espiritual.'),
  (24, 'profeta', 'Costumo perceber antes dos outros quando uma situação, projeto ou grupo está espiritualmente fora de direção.'),
  (25, 'profeta', 'Sinto o desejo de chamar as pessoas a uma caminhada de fé mais autêntica e sincera.'),
  (26, 'profeta', 'Tenho um forte desejo de que a igreja viva de forma mais sensível à direção do Espírito Santo, e não apenas seguindo métodos humanos.'),
  (27, 'profeta', 'Tenho facilidade em identificar quando um ambiente espiritual está pesado, opressivo ou desequilibrado.'),
  (28, 'profeta', 'Sinto que meu papel é falar a verdade com coragem e amor, chamando as pessoas à reflexão.'),
  (29, 'profeta', 'Me sinto motivado a interceder por pessoas, comunidades ou nações quando percebo que estão em um momento de crise espiritual.'),
  (30, 'profeta', 'Busco ouvir a direção de Deus com clareza para discernir caminhos em situações importantes.'),
  (31, 'profeta', 'Sinto que carrego uma responsabilidade de alertar outros quando percebo riscos espirituais, mesmo que não saibam ainda.'),
  (32, 'profeta', 'Meu senso de justiça é tão forte que fico inquieto ao ver líderes ou estruturas agindo de forma injusta ou manipuladora.'),
  (33, 'profeta', 'Percebo com sensibilidade quando algo está espiritualmente fora do lugar em um grupo ou pessoa.'),
  (34, 'profeta', 'Tenho facilidade em discernir se uma mensagem ou direção espiritual é genuína ou apenas emocional.'),
  (35, 'profeta', 'Desejo profundamente que a igreja volte a viver com mais poder espiritual, autenticidade e temor de Deus.'),
  (36, 'profeta', 'Tenho facilidade em articular com clareza o que percebo espiritualmente em uma situação, mesmo quando os outros ainda não viram.'),
  (37, 'profeta', 'Sinto uma profunda carga pela autenticidade espiritual, desejando que as palavras e ações das pessoas estejam alinhadas.'),
  (38, 'profeta', 'Me sinto chamado a falar palavras de encorajamento que constroem, fortalecem e confirmam o chamado das pessoas.'),
  (39, 'profeta', 'Costumo perceber temas espirituais recorrentes nas situações que vivencio e sinto necessidade de comunicá-los.'),
  (40, 'profeta', 'Tenho facilidade em inspirar outros à oração e à busca de Deus de forma mais intencional e profunda.'),
  (41, 'evangelista', 'Tenho facilidade em criar conexões rápidas com pessoas desconhecidas e construir pontes de relacionamento.'),
  (42, 'evangelista', 'Me sinto energizado quando estou em ambientes fora da igreja, especialmente em contato com pessoas que ainda não conhecem a fé.'),
  (43, 'evangelista', 'Fico naturalmente atento a oportunidades de iniciar conversas que podem levar a temas espirituais.'),
  (44, 'evangelista', 'Tenho um senso de urgência interior para compartilhar esperança com quem está em crise emocional ou espiritual.'),
  (45, 'evangelista', 'Me alegro profundamente ao ver alguém tomando decisões de transformação pessoal, especialmente em relação à fé.'),
  (46, 'evangelista', 'Costumo adaptar minha linguagem para que diferentes tipos de pessoas entendam mensagens espirituais complexas de forma simples.'),
  (47, 'evangelista', 'Sinto um impulso interior de não apenas convidar pessoas para a igreja, mas de ir até onde elas estão.'),
  (48, 'evangelista', 'Quando vejo alguém sofrendo ou vivendo sem propósito, sinto que preciso me aproximar e oferecer uma palavra de esperança.'),
  (49, 'evangelista', 'Tenho facilidade em compartilhar histórias de transformação de vida para inspirar outras pessoas.'),
  (50, 'evangelista', 'Acredito que a mensagem de esperança e reconciliação deve ultrapassar barreiras culturais, sociais ou religiosas.'),
  (51, 'evangelista', 'Me sinto desconfortável quando vejo a igreja ficando fechada em si mesma, sem alcançar quem está fora.'),
  (52, 'evangelista', 'Tenho prazer em organizar ou participar de ações que levem cuidado, serviço e esperança a lugares carentes ou marginalizados.'),
  (53, 'evangelista', 'Costumo ser aquele que encoraja amigos e irmãos de fé a também se envolverem na missão de alcançar outros.'),
  (54, 'evangelista', 'Quando compartilho sobre fé, costumo fazer de forma natural, durante conversas simples do cotidiano.'),
  (55, 'evangelista', 'Meu coração se comove ao ouvir histórias de pessoas que vivem longe da fé ou em situações de desesperança.'),
  (56, 'evangelista', 'Tenho facilidade em mobilizar grupos inteiros para saírem de suas zonas de conforto e se envolverem na missão.'),
  (57, 'evangelista', 'Me alegra criar pontos de contato e eventos que aproximem pessoas ainda não engajadas com uma comunidade de fé.'),
  (58, 'evangelista', 'Costumo lembrar das histórias das pessoas que alcancei e acompanho seu crescimento com interesse genuíno.'),
  (59, 'evangelista', 'Sinto energia especial ao participar de projetos de ação social que combinam cuidado prático com esperança espiritual.'),
  (60, 'evangelista', 'Tenho facilidade em identificar as perguntas que alguém ainda não expressou sobre fé e abrir espaço para que as faça.'),
  (61, 'pastor', 'Sinto uma responsabilidade interior de acompanhar pessoas em seu crescimento espiritual, caminhando ao lado delas com constância.'),
  (62, 'pastor', 'Tenho facilidade em perceber quando alguém está emocionalmente abatido ou espiritualmente desanimado, mesmo que a pessoa não diga nada.'),
  (63, 'pastor', 'Me preocupo em criar ambientes seguros e acolhedores, onde todos se sintam vistos, ouvidos e cuidados.'),
  (64, 'pastor', 'Quando vejo alguém se afastando da fé ou da comunidade, sinto vontade de me aproximar para resgatar essa pessoa.'),
  (65, 'pastor', 'Costumo manter contato e nutrir relacionamentos de longo prazo, mesmo quando as pessoas atravessam fases difíceis.'),
  (66, 'pastor', 'Tenho facilidade em ouvir com empatia, dando espaço para que as pessoas compartilhem suas dores e lutas.'),
  (67, 'pastor', 'Sinto que meu papel é ajudar as pessoas a restaurarem sua fé e esperança quando estão cansadas ou confusas.'),
  (68, 'pastor', 'Prefiro liderar de maneira relacional, buscando proximidade com cada pessoa do grupo.'),
  (69, 'pastor', 'Me sinto realizado quando percebo que alguém está crescendo e amadurecendo na fé por meio de acompanhamento próximo.'),
  (70, 'pastor', 'Tenho facilidade em identificar as necessidades espirituais ou emocionais das pessoas ao meu redor.'),
  (71, 'pastor', 'Em conflitos ou divisões, costumo assumir a responsabilidade de buscar reconciliação e restaurar a unidade.'),
  (72, 'pastor', 'Tenho prazer em discipular de forma pessoal, cuidando não apenas do aprendizado bíblico, mas também da vida emocional da pessoa.'),
  (73, 'pastor', 'Valorizo encontros pequenos, grupos caseiros ou momentos de acompanhamento individual como espaço de crescimento.'),
  (74, 'pastor', 'Sinto que minha maior contribuição para a comunidade é cuidar das pessoas, acompanhá-las e ajudá-las a permanecer firmes na fé.'),
  (75, 'pastor', 'Me preocupo com o equilíbrio emocional e espiritual das pessoas, desejando que elas se sintam nutridas e fortalecidas.'),
  (76, 'pastor', 'Me alegra criar tradições e rituais de cuidado em grupos, como visitas, celebrações e acompanhamentos periódicos.'),
  (77, 'pastor', 'Tenho facilidade em restaurar vínculos quebrados entre pessoas, ajudando-as a reconstruírem a confiança mútua.'),
  (78, 'pastor', 'Sinto que uma das minhas maiores forças é estar presente nas crises e tristezas das pessoas sem precisar resolver tudo imediatamente.'),
  (79, 'pastor', 'Me importo em celebrar cada pequena vitória das pessoas que acompanho, reconhecendo sua trajetória de crescimento.'),
  (80, 'pastor', 'Costumo perceber quando alguém precisa de acolhimento antes de receber qualquer ensinamento ou orientação.'),
  (81, 'mestre', 'Tenho prazer em estudar temas profundos da Bíblia e compartilhar descobertas com outras pessoas.'),
  (82, 'mestre', 'Sinto uma satisfação especial quando ajudo alguém a entender conceitos bíblicos que antes pareciam difíceis.'),
  (83, 'mestre', 'Gosto de estruturar ideias de forma lógica e clara antes de ensiná-las.'),
  (84, 'mestre', 'Costumo fazer conexões entre diferentes passagens da Bíblia para trazer um entendimento mais completo.'),
  (85, 'mestre', 'Sinto um desejo constante de aprender mais sobre as Escrituras, história da igreja ou teologia.'),
  (86, 'mestre', 'As pessoas geralmente me procuram quando têm dúvidas teológicas ou querem entender melhor um texto bíblico.'),
  (87, 'mestre', 'Me sinto chamado a ajudar a igreja a crescer em maturidade através de um ensino sólido e equilibrado.'),
  (88, 'mestre', 'Tenho facilidade em identificar erros doutrinários e sinto necessidade de alertar quando percebo distorções na interpretação da Bíblia.'),
  (89, 'mestre', 'Gosto de preparar estudos bíblicos, materiais didáticos ou séries de ensino para pequenos grupos ou igreja.'),
  (90, 'mestre', 'Costumo fazer perguntas profundas que incentivam outros a refletirem com mais seriedade sobre sua fé.'),
  (91, 'mestre', 'Acredito que o crescimento espiritual saudável precisa estar fundamentado num ensino fiel à Palavra de Deus.'),
  (92, 'mestre', 'Me preocupo com a clareza das mensagens que são ensinadas, buscando sempre contextualizar sem perder a fidelidade bíblica.'),
  (93, 'mestre', 'Sinto alegria ao ver pessoas sendo transformadas pelo conhecimento prático da Palavra, não apenas pela emoção do momento.'),
  (94, 'mestre', 'Gosto de analisar contextos históricos e culturais para entender melhor os significados das passagens bíblicas.'),
  (95, 'mestre', 'Tenho facilidade em organizar cronogramas de ensino, séries temáticas ou conteúdos de discipulado.'),
  (96, 'mestre', 'Tenho prazer em adaptar conteúdos bíblicos para diferentes faixas etárias, culturas ou níveis de maturidade espiritual.'),
  (97, 'mestre', 'Me alegra ver pessoas aplicando princípios bíblicos em suas decisões práticas do dia a dia.'),
  (98, 'mestre', 'Sinto um entusiasmo especial ao descobrir conexões entre o texto bíblico e situações contemporâneas relevantes.'),
  (99, 'mestre', 'Costumo investir tempo em preparar materiais de ensino que facilitem o aprendizado e a memorização das verdades bíblicas.'),
  (100, 'mestre', 'Me sinto realizado ao formar outros ensinadores, capacitando-os a comunicar a Palavra com clareza e profundidade.')
ON CONFLICT (id) DO UPDATE
  SET text = EXCLUDED.text,
      category = EXCLUDED.category,
      updated_at = now();
