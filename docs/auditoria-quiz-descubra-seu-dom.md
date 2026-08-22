# Auditoria — Quiz "Descubra seu Dom" (Five One)

Auditoria de ponta a ponta do teste de dom ministerial (`fiveonemovement.com/descubra-seu-dom`).
Somente leitura — nenhuma alteração de código ou dado foi feita. Data: 22/08/2026.

Escopo verificado: código-fonte (front + Cloudflare Functions), migrations do Supabase (schema + RLS),
e um teste **read-only** contra produção para confirmar exposição de dados.

---

## 0. Inventário e mapa do fluxo (Fase 0)

**Arquivos do quiz:**

| Camada | Arquivo |
|---|---|
| Landing/intro + 50 etapas + form + resultado | `src/features/institucional/pages/Quiz.tsx` (1591 linhas) |
| Página pública de resultado por token | `src/features/institucional/pages/QuizResult.tsx` |
| Tipos e textos de dom | `src/features/institucional/types/quiz.ts` |
| **Banco de itens (100 afirmações) + pareamento** | `src/features/institucional/data/questions.ts` |
| Estilos | `src/features/institucional/pages/Quiz.css` (3093 linhas) |
| Geração de PDF | `src/shared/utils/pdfGenerators/*.ts` |
| Relatório admin (front) | `src/features/plataforma/pages/admin/RelatorioQuiz.tsx` |
| Backend (Cloudflare Functions) | `functions/api/quiz-session.ts`, `quiz-store.ts`, `quiz-result.ts`, `quiz-result-by-token.ts`, `send-quiz.ts`, `quiz-admin-list.ts` |
| Schema + RLS | `supabase/migrations/2026041811/12/10*.sql` e `2026030605/17*.sql` |

**Fluxo de dados:**
1. `POST /api/quiz-session` ao clicar "Começar" → cria linha em `quiz_session` (rastreia início/abandono). `device_type` derivado do user-agent **no servidor**.
2. Cada resposta acumula em `answersRef` (memória do cliente). A cada 10 etapas, `PATCH /api/quiz-session` grava `last_step` (funil de abandono).
3. Pontuação calculada **100% no cliente** (`categoryScores` em React state).
4. Após 50 etapas → tela de formulário (gate) → `POST /api/quiz-store` grava `quiz_response` + insere todas as `quiz_answer` de uma vez + marca a sessão como `completed`.
5. `POST /api/send-quiz` (independente) gera e envia o e-mail com PDF via Resend.
6. Link público `/resultado/:token` lê via `GET /api/quiz-result-by-token`.

**Modelo de dados (bem estruturado):** `quiz_session (1) → quiz_response (1) → quiz_answer (N)`. Sem redundância real; `session` é funil, `response` é lead+resultado, `answer` é resposta individual.

**Testes automatizados:** **nenhum** (zero arquivos `.test`/`.spec` no projeto).

---

## 1. Sumário executivo

1. **Vazamento total de leads em produção:** `GET /api/quiz-admin-list` não tem autenticação alguma — qualquer pessoa na internet baixa nome, e-mail e telefone dos **67 leads** (confirmado ao vivo, HTTP 200).
2. **O resultado é comunicado como "forte inclinação" quando é ruído estatístico:** os percentuais são normalizados para somar ~100% entre 5 dons, então o topo quase sempre cai em 20–30% (a média por acaso é 20%) — e a tela chama isso de "forte inclinação".
3. **O link "salve seu resultado" está quebrado:** ele gera uma URL com `#/resultado/TOKEN`, mas o app usa BrowserRouter (sem hash) — quem abrir o link cai na tela inicial do quiz, não no resultado.
4. **Sem consentimento LGPD:** o formulário coleta nome, e-mail e telefone sem checkbox de aceite nem link para política de privacidade — obrigação legal na captação de dados pessoais.
5. **Instrumento com vieses estruturais não controlados:** posição das opções nunca é randomizada (a 1ª afirmação está sempre em cima), os confrontos entre dons não são balanceados, e afirmações "socialmente desejáveis" (Apóstolo/Pastor) competem com afirmações de nicho (Profeta) — enviesando o resultado.

---

## 2. Achados críticos

### C1 — `quiz-admin-list` expõe todos os leads sem autenticação 🔴 CONFIRMADO EM PRODUÇÃO
- **Onde:** `functions/api/quiz-admin-list.ts` (arquivo inteiro; usa `SUPABASE_SERVICE_ROLE_KEY` nas linhas 24–28, **sem nenhuma verificação de auth**). O `functions/_middleware.ts` deixa `/api/*` passar direto (linha 193). `RelatorioQuiz.tsx` chama o endpoint com `fetch` **sem header Authorization** (linha 269).
- **Prova ao vivo (read-only):** `GET https://fiveonemovement.com/api/quiz-admin-list?page=1&limit=1` → **HTTP 200**, `ok:true`, com campos `person_email`/`person_phone` e `"total":67`.
- **Por que importa:** vazamento de PII de todos os leads (nome, e-mail, telefone) + `result_token` de cada resposta. Violação de LGPD e do principal ativo comercial do Five One. Outros endpoints admin (`create-student`, `delete-student`) **usam** `_adminAuth.ts` — este ficou de fora.
- **Como corrigir:** exigir autenticação admin no endpoint (importar e aplicar `functions/api/_adminAuth.ts`, como os outros endpoints admin fazem) **antes** de qualquer query. Enquanto isso, considerar bloquear a rota. Parar de retornar `result_token` na listagem.

### C2 — Sem consentimento LGPD na captação 🔴
- **Onde:** formulário em `Quiz.tsx` linhas 905–1108 — três campos (nome/e-mail/telefone) e botão "Ver resultado", **sem checkbox de consentimento nem link para política de privacidade**.
- **Por que importa:** coleta de dado pessoal sensível sem base legal explícita. Combinado com C1, é exposição jurídica real.
- **Como corrigir:** checkbox obrigatório de aceite + link para política de privacidade antes de habilitar o envio; registrar consentimento (timestamp/versão) junto do lead.

### C3 — Link de resultado compartilhável quebrado 🔴 (bug funcional)
- **Onde:** `Quiz.tsx` linha 1392 monta `` `${origin}${pathname}#/resultado/${token}` ``. A rota real é BrowserRouter, `/resultado/:token` (`App.tsx` linha 294; router em `App.tsx` linha 4).
- **Por que importa:** o link copiado vira `.../descubra-seu-dom#/resultado/TOKEN`; o BrowserRouter ignora o `#...` e renderiza a **tela inicial do quiz**, não o resultado. O recurso "salve o link para revisitar" não funciona.
- **Como corrigir:** gerar `` `${origin}/resultado/${token}` `` (sem hash, sem pathname atual).

### C4 — Percentual normalizado comunicado como "força" do dom 🔴 (validade)
- **Onde:** `Quiz.tsx` — cálculo em `computeScoresForEmail` (linhas 81–86) e na tela de resultado (linhas 1141–1151): `score / totalPontos * 100`. Frase "forte inclinação" em `Quiz.tsx` linha 897.
- **Por que importa:** como os 5 dons somam ~100%, o topo naturalmente fica em 20–35%. A média **por puro acaso é 20%**. Um "24% Apóstolo" é quase ruído, mas a interface afirma "forte inclinação para o dom de X". Isso mina a credibilidade do teste.
- **Como corrigir (escolher a intenção do produto):**
  - **Opção A (recomendada):** comunicar por **ranking + dom primário e secundário**, não por fatia de pizza. Ex.: "Seu dom principal é X, seguido de Y." O gráfico radar já existe e comunica isso melhor que o percentual isolado.
  - **Opção B:** exibir **percentual de aproveitamento por dom** (pontos do dom ÷ máximo possível daquele dom), que dá uma escala 0–100% interpretável — mas exige repensar o denominador.
  - Em ambos, calibrar a linguagem: "forte inclinação" só acima de um limiar real de separação entre 1º e 2º.

### C5 — Vieses estruturais do instrumento 🔴 (validade)
- **Posição nunca randomizada:** `Quiz.tsx` 1476–1498 sempre renderiza `statement1` em cima e `statement2` embaixo. Como `getRandomComparisonPair` (`questions.ts` 555–613) coloca em `statement1` sempre a categoria com mais itens restantes, há **viés de primazia** sistemático.
- **Confrontos entre dons não balanceados:** o pareamento é guloso (pega as 2 categorias com mais itens restantes), não um desenho contrabalanceado. Cada dom aparece em exatamente **20 pares** (100 afirmações ÷ 2 por par, 20 por dom — isso está OK), **mas** as 10 combinações possíveis de dons **não** aparecem 5 vezes cada; alguns confrontos ocorrem mais que outros.
- **Desejabilidade social:** afirmações de Apóstolo/Pastor são amplas e aspiracionais ("visão estratégica", "capacitar e enviar", "acolher") enquanto as de Profeta são intensas/nicho ("peso emocional profundo", "confronta e me torna impopular"). Competindo lado a lado, as amplas vencem por redação, não por identificação real.
- **Como corrigir:** randomizar a posição (cima/baixo) por par; adotar desenho contrabalanceado (cada par de dons aparece o mesmo nº de vezes); revisar/nivelar a redação das afirmações para equilibrar desejabilidade.

### C6 — Pontuação manipulável e mapeamento exposto no cliente 🟠
- **Onde:** pontuação em `Quiz.tsx` `onHandleChoice` (525–539); o cliente **envia** `scores`/`rawScores` prontos ao servidor (`quiz-store` apenas grava). O mapa afirmação→dom vai no bundle (`data/questions.ts`).
- **Por que importa:** o resultado é forjável (POST arbitrário) e o "gabarito" é público. Para um teste gratuito de captação o risco é baixo, mas a integridade dos dados analíticos fica comprometida.
- **Como corrigir:** recalcular o score **no servidor** a partir das `answers[]` (que já são enviadas), ignorando os scores do cliente.

---

## 3. Achados importantes

### Pontuação e opções extras
- **I1 — "Me identifico com as duas" infla o denominador:** `Quiz.tsx` 528–530 dá +1 a **cada** dom do par → soma total cresce e achata todos rumo a 20%. Quem clica "as duas" com frequência dilui o próprio topo.
- **I2 — "Nenhuma das opções" reduz a base:** 531–536 não pontua nada → total de pontos menor, cada ponto vale mais %. Dois usuários com o mesmo padrão de escolha mas quantidades diferentes de "nenhuma" recebem percentuais diferentes.
- **I3 — Sem detecção de padrão inválido:** não há checagem de *straight-lining* (sempre a 1ª opção) nem de "as duas" em massa. Respostas lixo entram como válidas.
- **I4 — Empate não aparece na tela:** PDF e e-mail tratam empate técnico (`tiedDoms`, 638–645/1015–1020), mas a tela mostra só `sortedScores[0]` (topo por ordem de desempate estável). Inconsistência de comunicação entre tela e PDF.
- **I5 — Tela vs PDF podem divergir ~1%:** a tela usa `Math.round` por dom (1159), o PDF usa `toFixed(1)` (mainPdfGenerator 240) — mesmos dados, arredondamentos diferentes; a soma na tela pode dar 99–101%.

### Banco de dados
- **I6 — Sem deduplicação/idempotência:** `quiz-store` faz `insert` puro (sem `upsert`). Mesmo e-mail refazendo o teste = novo lead a cada vez; duplo POST = registros duplicados. O admin só **reporta** duplicatas (`duplicateEmails`), não previne. **Definir política:** atualizar, versionar ou bloquear reenvio do mesmo e-mail.
- **I7 — Gravação em bloco único no fim:** as 50 `quiz_answer` são inseridas de uma vez em `quiz-store`. Se esse insert falhar, ele só faz `console.error` e não bloqueia — o lead é salvo mas as respostas individuais se perdem, **sem retry e sem aviso** (`quiz-store` + `Quiz.tsx` 1091–1093). O funil de abandono (`session.last_step`) sobrevive, mas a calibração por resposta some.
- **I8 — Instrumento hardcoded no front, sem versionamento:** as 100 afirmações vivem em `data/questions.ts`. Alterar uma exige deploy e **quebra a comparabilidade histórica** — `quiz_answer` guarda `statement_a_id/b_id` (int), mas não há campo de versão do instrumento. **Recomendo** um campo `instrument_version` em `quiz_response` (e idealmente mover as afirmações para o banco).
- **I9 — Validação server-side quase ausente:** `quiz-store`/`send-quiz` não validam formato de e-mail/telefone nem impõem limite de tamanho de payload (answers/scores/base64 do PDF). Validação existe só no cliente (`Quiz.tsx` 930/947/972).
- **I10 — Vazamento de mensagens de erro internas:** quase todos os endpoints retornam `error.message`/`String(e)` ao cliente (ex.: `quiz-store` 116/164; `quiz-result-by-token` 30/58). Logar no servidor e responder mensagem genérica.
- **I11 — Sem rate limiting / anti-bot / verificação de origem:** nenhum endpoint tem throttling; `send-quiz` usa `Access-Control-Allow-Origin: *` (linha 9). O `ip_hash` é coletado mas não usado para limitar. Além disso, as políticas RLS permitem `INSERT` anônimo direto via PostgREST (`quiz_*_insert_public WITH CHECK (true)`) — um bot pode inserir leads falsos direto no banco com a anon key do bundle.
- **I12 — Injeção de filtro PostgREST (menor):** `quiz-admin-list` interpola `search` cru em `.or(...)` (linha 50). Sem sanitização, vírgula/parênteses podem alterar a expressão do filtro. (Depende de C1 estar aberto.)

**Ponto positivo (RLS bem-feito):** `quiz_response`, `quiz_answer` e `quiz_session` têm RLS ativo com `SELECT` só para admin. Teste read-only confirmou: anon lendo direto via PostgREST retorna `[]` (HTTP 200, zero linhas) nas três tabelas. O vazamento (C1) é **pelo endpoint com service_role**, não pelo banco. `result_token` é `crypto.randomUUID()` (seguro, não enumerável). `quiz-result-by-token` **não** expõe e-mail/telefone.

### UX estrutural
- **I13 — Sem botão "Voltar":** só existe "Próxima Etapa" (`Quiz.tsx` 1524–1548). Impossível corrigir um clique errado em 50 etapas.
- **I14 — Sem persistência de progresso:** fechar a aba/refresh na etapa 40 zera tudo (estado só em React; `beforeunload` apenas avisa). Considerar salvar progresso em `localStorage`.
- **I15 — 50 etapas × 2 cliques:** não há auto-avanço — cada etapa exige selecionar **e** clicar "Próxima Etapa" (100 cliques). O botão fica desabilitado até haver seleção (bom), mas avaliar auto-avanço opcional.
- **I16 — Comprimento:** 50 pares/~10 min é longo para tráfego de Instagram (majoritariamente mobile). Avaliar reduzir para 30–40 mantendo confiabilidade, ou lógica adaptativa (encerrar quando a separação entre dons já é clara).

---

## 4. Melhorias (visual e microinterações)

- **M1 — Hierarquia tipográfica invertida:** "Etapa X de 50" é `<h2>` (grande) e a pergunta real "Selecione a afirmação..." é `<p>` (pequena) — `Quiz.tsx` 1469–1473. Inverter: destacar a instrução, reduzir o contador.
- **M2 — Banner verde de confirmação de e-mail destoa da paleta:** `email-info-banner` / toast com `#32f2cf` sobre fundo escuro (`Quiz.tsx` 1116–1135/1165–1188). Aplicar cor como acento, não fundo cheio, alinhado à identidade menta-sobre-marinho.
- **M3 — Monotonia visual das 50 etapas:** layout idêntico do início ao fim. Variação sutil por bloco (tom de fundo, ícone do dom aparecendo progressivamente) reduz fadiga.
- **M4 — Ícones dos 5 dons subutilizados:** ativo bonito que só aparece na intro e no resultado. Usar nos blocos/nos marcos da barra.
- **M5 — Barra de progresso:** já tem preenchimento contínuo + 5 marcos (`Quiz.tsx` 1449–1467), mas sem % nem tempo restante. Adicionar percentual e/ou estimativa de tempo.
- **M6 — Cards de afirmação com pouca diferenciação:** muito espaço vazio, baixa distinção entre as duas opções.
- **M7 — Sem tela de transição/celebração ao concluir as 50 etapas:** o usuário sai da etapa 50 direto para o formulário (anticlimático). Uma micro-celebração antes do gate melhora a conversão.
- **M8 — Acessibilidade:** as opções são `<button>`, não radios semânticos (sem `role="radiogroup"`); a mudança de etapa não tem `aria-live` (leitores de tela não anunciam "Etapa X"); revisar contraste do texto cinza sobre o fundo azul na tela "Quase lá!".

---

## 5. Oportunidades (ganhos não capturados)

- **O1 — Régua de nutrição pós-teste:** hoje o lead recebe o e-mail de resultado e "morre" ali. O resultado é o gancho natural para uma sequência automatizada rumo ao curso de Apologética e à Escola Five One. **Maior oportunidade comercial do fluxo.**
- **O2 — O compartilhamento já existe, mas está subaproveitado:** há geração de **imagem 1080×1080 para stories** (`handleShareImage`, `Quiz.tsx` 672–769) e botão de copiar link — mas o link está quebrado (C3) e a imagem some se `resultToken` não vier. Consertar C3 destrava um motor de crescimento orgânico.
- **O3 — Analytics de funil por etapa:** os eventos GA `quiz_start`/`quiz_completed`/`quiz_form_submitted` existem, mas não há evento por marco (10/20/30/40) no GA — embora `quiz_session.last_step` já capture isso no banco. Unificar num painel de funil (começaram → etapa N → formulário → concluíram).
- **O4 — Telefone obrigatório derruba conversão:** 11 dígitos exigidos (`Quiz.tsx` 947/973). Avaliar torná-lo opcional (ou remover) e medir o impacto na taxa de conclusão do formulário.
- **O5 — Resultado como conteúdo:** enriquecer a tela com versículos de referência por dom e "próximos passos" concretos (já há CTA para a Escola, `Quiz.tsx` 1329–1343; dá para ampliar).
- **O6 — Limpeza de código morto:** `getProfileTextForDom` (`types/quiz.ts` 41–58, só tem texto de Apóstolo) nunca é usado; `confirmLeave`/`cancelLeave` são no-ops e há um `{false && (modal)}` (`Quiz.tsx` 1570). Remover para reduzir ruído/risco.

---

## 6. Roadmap sugerido (esforço × impacto)

**🚨 Agora (baixo esforço, impacto crítico) — fazer hoje:**
- C1 — proteger `/api/quiz-admin-list` com `_adminAuth` (vazamento ativo de PII).
- C3 — corrigir o link de resultado (`/resultado/${token}` sem hash).
- C2 — checkbox de consentimento LGPD + link de política no formulário.
- I10 — parar de vazar `error.message` ao cliente.

**⏳ Próxima sprint (esforço médio, impacto alto):**
- C4 — reformular a comunicação do resultado (ranking + dom primário/secundário; calibrar "forte inclinação").
- C6/I7 — recalcular o score no servidor a partir de `answers[]` e persistir com retry.
- I6 — política de deduplicação por e-mail (atualizar/versionar/bloquear).
- I9/I11 — validação server-side + rate limiting (Cloudflare) + fechar `INSERT` anônimo direto no PostgREST.
- O1 — desenhar a régua de nutrição pós-resultado.

**🗓️ Depois (esforço maior, impacto estrutural):**
- C5 — randomizar posição, contrabalancear confrontos e revisar desejabilidade das afirmações.
- I8 — versionar o instrumento (`instrument_version`) e/ou mover afirmações para o banco.
- I16/I13/I14 — reduzir/adaptar nº de etapas, botão "Voltar", persistência de progresso.
- M1–M8 — refino visual e acessibilidade.
- Cobertura de testes (hoje: zero) para a lógica de pontuação e os endpoints.

---

## Restrições respeitadas
- Nenhuma alteração de código ou de dados de produção.
- Testes de RLS e do endpoint admin feitos **somente em leitura**; nenhum dado pessoal foi impresso ou retido (arquivos temporários removidos).
