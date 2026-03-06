# Five One Landing

Guia curto da convenção de pastas adotada no projeto.

## Estrutura

```text
src/
  features/
    institucional/   # Site institucional, blog, quiz e formulários públicos
    plataforma/      # Plataforma do aluno, admin da plataforma e serviços da plataforma
    rede/            # Rede de igrejas, área de membro e serviços da rede
  shared/            # Código reutilizável entre domínios
    components/
    lib/
    styles/
    utils/
  assets/            # Imagens/arquivos estáticos globais do app
```

## Regras rápidas

1. Coloque páginas, componentes, dados e serviços **no domínio da feature** (`features/<dominio>`).
2. Só mova para `shared/` o que for realmente reutilizado por mais de um domínio.
3. Evite acoplamento entre domínios:
   - `institucional` não deve depender de implementação interna de `rede`/`plataforma`.
   - Se algo precisa ser comum, extraia para `shared`.
4. Mantenha CSS próximo do componente/página (co-location).
5. Novas rotas devem ser registradas em `src/App.tsx`.

## Convenção por tipo

- `features/<dominio>/pages`: páginas e rotas
- `features/<dominio>/components`: componentes específicos do domínio
- `features/<dominio>/services`: acesso a API/Supabase/regras de dados do domínio
- `features/<dominio>/data`: dados estáticos do domínio
- `features/<dominio>/hooks`: hooks específicos do domínio
- `shared/components`: UI compartilhada
- `shared/utils`: utilitários genéricos
- `shared/lib`: clientes/base de integração (ex.: supabase client)

## Scripts

- `npm run dev`: ambiente local
- `npm run build`: checagem TypeScript + build de produção
- `npm run lint`: lint do projeto

## Checklist antes de subir PR

1. `npm run build` passando
2. Imports sem caminhos antigos (`src/pages`, `src/components`, etc.)
3. Arquivos novos no domínio correto
4. Código compartilhado extraído para `shared` apenas quando necessário
