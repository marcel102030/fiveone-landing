# Quiz "Descubra seu Dom" — Melhorias Fase 2

Implementação dos itens C4, C6/I7, I6, I9, I11 e O1 do relatório de auditoria.
Data: 22/08/2026.

---

## O que mudou no código (já commitado)

| Item | Mudança | Arquivos |
|---|---|---|
| **C4** | Resultado comunica **ranking + dom principal/secundário** e nota honesta ("percentuais são relativos, o que importa é o ranking"). Removido o "forte inclinação" genérico; agora a linguagem é calibrada pela distância entre 1º e 2º (predominante / principal+secundário / equilibrado / empate). | `Quiz.tsx`, `QuizResult.tsx` |
| **C6** | Pontuação **recalculada no servidor** a partir de `answers[]` (mapa afirmação→dom por faixa de id). Os scores do cliente viram só fallback → resultado não é mais forjável. | `functions/api/quiz-store.ts` |
| **I7** | `insert` de `quiz_response` e `quiz_answer` com **retry** (3 tentativas). | `functions/api/quiz-store.ts` |
| **I6** | **Idempotência por sessão**: duplo-POST/refresh da mesma sessão devolve o registro existente (não duplica). Refazer o teste (nova sessão) segue criando registro novo — política "sempre novo". | `functions/api/quiz-store.ts` |
| **I9** | **Validação server-side**: e-mail (formato), telefone (10–13 dígitos), limite de `answers` (≤60), tipos. | `functions/api/quiz-store.ts` |
| **I11** | Migration que **fecha o INSERT anônimo** direto via PostgREST nas 3 tabelas do quiz. | `supabase/migrations/20260822120000_*` |
| **O1** | Régua de nutrição: colunas de controle + endpoint de envio + descadastro. | migration `..130000`, `quiz-nurture-run.ts`, `quiz-unsubscribe.ts` |

---

## ⚠️ Ações necessárias do seu lado (não dá para eu fazer)

### 1. Aplicar as migrations no Supabase
```bash
supabase db push
```
Aplica: fechamento do INSERT anônimo (I11) e as colunas da régua de nutrição (O1).
**Faça isso antes** de ligar o cron da régua (o endpoint depende das novas colunas).

### 2. Variáveis de ambiente no Cloudflare Pages (Settings → Environment variables)
- `NURTURE_CRON_SECRET` — **crie** um valor secreto forte (ex.: um UUID). Protege o endpoint da régua.
- `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_REPLY_TO` — já devem existir (usados pelo `send-quiz`). Confirme.

### 3. Rate limiting (I11) — regra no painel Cloudflare
Painel Cloudflare → domínio `fiveonemovement.com` → **Security → WAF → Rate limiting rules → Create rule**:
- **Nome:** `quiz-write-limit`
- **If incoming requests match:** `URI Path` **contains** `/api/quiz-store` **OR** `URI Path` contains `/api/quiz-session` **OR** `URI Path` contains `/api/send-quiz`
- **Rate:** `20` requests per `1 minute`
- **Counting characteristic:** `IP`
- **Then:** `Block` (ou *Managed Challenge*) por `10 minutes`

> Isso protege os endpoints públicos de escrita contra flood de leads falsos, sem afetar o uso normal (um usuário faz ~1 submissão a cada 10 min).

### 4. Agendar a régua de nutrição (cron diário)
O endpoint `POST /api/quiz-nurture-run` envia os e-mails devidos e avança o estágio.
Ele **não roda sozinho** — precisa de um agendador chamando-o 1×/dia. Duas opções:

**Opção A — GitHub Actions (recomendada, o repo já está no GitHub):**
Crie `.github/workflows/nurture.yml`:
```yaml
name: quiz-nurture
on:
  schedule:
    - cron: "0 12 * * *"   # todo dia 12:00 UTC (~09:00 BRT)
  workflow_dispatch: {}
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -fsS -X POST https://fiveonemovement.com/api/quiz-nurture-run \
            -H "X-Nurture-Secret: ${{ secrets.NURTURE_CRON_SECRET }}"
```
E adicione o secret `NURTURE_CRON_SECRET` em GitHub → Settings → Secrets and variables → Actions (mesmo valor do passo 2).

**Opção B — cron-job.org / Cloudflare Worker Cron:** chamar a mesma URL, método POST, com o header `X-Nurture-Secret`.

---

## O1 — A régua de nutrição (o que os leads recebem)

Sequência automática de 3 e-mails, contados a partir do dia em que a pessoa fez o teste. Todos com identidade Five One (navy/mint) e link de descadastro (LGPD).

| Quando | Estágio | Assunto | Conteúdo | CTA |
|---|---|---|---|---|
| **D+1** | 1 | "Seu dom de {X} — e o próximo passo" | Recap do dom principal; descobrir é só o começo, o que transforma é desenvolver. | Rever meu resultado (`/resultado/{token}`) |
| **D+3** | 2 | "Como desenvolver o seu dom de {X}" | Conteúdos gratuitos para entender e praticar o chamado. | Ler conteúdos (`/para-ler`) |
| **D+7** | 3 | "O próximo passo do seu chamado" | Convite à Escola Five One (formação ministerial). | Conhecer os cursos (`/cursos`) |

- **Personalização:** primeiro nome + nome do dom principal.
- **Descadastro:** cada e-mail traz link `/api/quiz-unsubscribe?token=...` → marca `unsubscribed=true` e mostra página de confirmação. Leads descadastrados não recebem mais nada.
- **Idempotência:** cada envio avança `nurture_stage`; se o envio falhar, o estágio não avança e é reprocessado na execução seguinte.
- **Cadência real:** depende da frequência do cron (diário → cada estágio dispara no primeiro run após atingir a idade mínima).

**Ajustar copy/timing:** edite `STAGES` em `functions/api/quiz-nurture-run.ts` (assunto, corpo e `afterDays`).

---

## Ainda pendente do roadmap (fases seguintes, não neste bloco)
- C5 (contrabalancear instrumento, randomizar posição, revisar desejabilidade)
- I8 (versionar instrumento)
- Dedupe "somente leads únicos" na listagem do relatório (hoje: idempotência + histórico completo)
- Botão "Voltar" / persistência de progresso / redução de etapas
- Testes automatizados
