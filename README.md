# ImoBoost AI

SaaS para agências imobiliárias portuguesas: transforma um imóvel angariado num pack de marketing pronto a publicar, gere todo o pipeline comercial e mantém a equipa alinhada — tudo numa única plataforma multi-tenant.

## Os três módulos

- **Estúdio de Marketing Imobiliário (IA)** — `/app/studio`
  Carrega fotos de um imóvel e gera título comercial, descrição, legendas para redes sociais e vídeos promocionais. Gestão de imagens (upload, etiquetas, aprovação) e packs de campanha por imóvel.
- **Área Comercial** — `/app/commercial`
  CRM de contactos com pipeline por estado, tarefas da equipa, comissões (com cálculo automático da percentagem da agência/agente) e escala semanal de turnos.
- **Feed Interno** — `/app/feed` e `/app`
  Mural da agência com publicações fixadas/destacadas, gostos e comentários. Negócios marcados como "pago" publicam automaticamente uma celebração no feed.

Os três módulos estão interligados: fechar uma comissão gera um post no feed, um contacto fechado permite criar a comissão associada num clique, e a página de um imóvel lista os contactos interessados nesse imóvel.

## Stack técnica

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4, componentes de UI escritos à mão no estilo shadcn/ui
- [Supabase](https://supabase.com) — Postgres, Auth, Storage e Row Level Security multi-tenant por agência
- Camada de geração de conteúdo/vídeo por IA abstraída por fornecedor (mock incluído, pronta a ligar a um fornecedor real)

## Começar a desenvolver

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o Supabase

Cria um projeto em [supabase.com](https://supabase.com) e aplica as migrations por ordem (SQL Editor do Supabase ou `supabase db push`):

```
supabase/migrations/0001_extensions_enums.sql
supabase/migrations/0002_tables.sql
supabase/migrations/0003_functions_triggers.sql
supabase/migrations/0004_rls_policies.sql
supabase/migrations/0005_storage.sql
```

Copia `.env.example` para `.env.local` e preenche com as chaves do teu projeto (Project Settings > API):

```bash
cp .env.example .env.local
```

### 3. (Opcional) Popular com dados de demonstração

Com o `SUPABASE_SERVICE_ROLE_KEY` definido em `.env.local`, corre:

```bash
npm run seed
```

Cria a agência de demonstração "Albi Imobiliária" com uma equipa completa, imóveis, contactos, tarefas, comissões, escala semanal e publicações no feed. Idempotente — pode ser corrido várias vezes sem duplicar dados. As credenciais de acesso (também usadas pelo botão "Entrar em modo demo" no login) ficam definidas em `lib/demo.ts`.

### 4. Arrancar o servidor de desenvolvimento

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build de produção |
| `npm run lint` | ESLint |
| `npm run seed` | Popula a agência de demonstração no Supabase configurado |

## Estrutura do projeto

```
app/                  Rotas (App Router): /login, /onboarding, /pricing, /app/*
components/           Componentes de UI por módulo + primitivas partilhadas
lib/actions/          Server actions (mutações)
lib/data/             Leitura de dados (server-only, respeita RLS)
lib/ai/, lib/video/   Abstrações de geração de conteúdo por IA/vídeo
lib/supabase/         Clientes Supabase (browser, server, admin)
lib/types/domain.ts   Tipos do domínio (espelham os enums/tabelas da BD)
supabase/migrations/  Esquema da base de dados + políticas RLS
scripts/seed.ts       Script de dados de demonstração
```
