# Changelog

Todas as mudanças técnicas relevantes da Biblioteca de Zines são registradas
neste arquivo. A data de uma entrada publicada é a data em que a mudança foi
incorporada à `main`; mudanças que ainda estão apenas em uma branch ficam em
`Unreleased`.

O formato segue o [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
com as categorias traduzidas para pt-BR.

## Unreleased

### Adicionado

- **Implement source metadata observations**: contrato, persistência, extração,
  inventário em lote e correções de observações de metadados das fontes. [PR #167](https://github.com/lumamontes/biblioteca-de-zines/pull/167) [commit 2a5894c](https://github.com/lumamontes/biblioteca-de-zines/commit/2a5894c) [commit d8684aa](https://github.com/lumamontes/biblioteca-de-zines/commit/d8684aa)
- **feat: add novidades and publications**: histórico editorial, publicações e
  visão técnica do projeto. [commit 594a1f3](https://github.com/lumamontes/biblioteca-de-zines/commit/594a1f36dcd993c6ba206a1e8cae68d5c77927de)
- **feat: isolate reader viewer in monorepo**: runtime isolado do viewer em um
  monorepo pnpm, com integração ao catálogo, contratos, rollout, fallback,
  métricas e benchmark. [PR #158](https://github.com/lumamontes/biblioteca-de-zines/pull/158) [commit 3338ad1](https://github.com/lumamontes/biblioteca-de-zines/commit/3338ad1) [commit 366985b](https://github.com/lumamontes/biblioteca-de-zines/commit/366985b) [commit da053f6](https://github.com/lumamontes/biblioteca-de-zines/commit/da053f6) [commit 3d351a4](https://github.com/lumamontes/biblioteca-de-zines/commit/3d351a4)
- **feat: improve author links and discovery**: plataformas, financiamento,
  previews, metadados em cache, links descritivos e agrupamento por inicial.
  [commit 6956df8](https://github.com/lumamontes/biblioteca-de-zines/commit/6956df8) [commit 526e729](https://github.com/lumamontes/biblioteca-de-zines/commit/526e729) [commit 4247fc1](https://github.com/lumamontes/biblioteca-de-zines/commit/4247fc1) [commit c196083](https://github.com/lumamontes/biblioteca-de-zines/commit/c196083) [commit 7ebbec2](https://github.com/lumamontes/biblioteca-de-zines/commit/7ebbec2) [commit c3dcc17](https://github.com/lumamontes/biblioteca-de-zines/commit/c3dcc17)

## 2026-10-12

### Adicionado

- **feat: add resilient zine page processing**: processamento assíncrono,
  gerações completas, retries, ativação segura e capas derivadas. [PR #134](https://github.com/lumamontes/biblioteca-de-zines/pull/134) [PR #143](https://github.com/lumamontes/biblioteca-de-zines/pull/143)

### Descontinuado

- **Cover-only processing**: processamento somente da capa restrito à
  compatibilidade e à migração legada. [ADR 12](docs/decisions/12-cover-only-processing-at-publication.md)

## 2026-09-23

### Adicionado

- **feat: add repeatable archive inventory**: inventário reproduzível de
  registros, arquivos locais e evidências. [PR #127](https://github.com/lumamontes/biblioteca-de-zines/pull/127)

## 2026-09-13

### Adicionado

- **feat: automate PDF monitoring from Supabase**: workflow para monitorar
  PDFs publicados a partir do Supabase. [PR #101](https://github.com/lumamontes/biblioteca-de-zines/pull/101)

## 2025-12-21

### Adicionado

- **Feat/add pagination authors page**: paginação e páginas de autores com
  slugs. [PR #94](https://github.com/lumamontes/biblioteca-de-zines/pull/94)

### Segurança

- **Fix React Server Components CVE vulnerabilities**: correção de
  vulnerabilidades de React Server Components. [PR #95](https://github.com/lumamontes/biblioteca-de-zines/pull/95)

## 2025-07-09

### Adicionado

- **category filtering**: melhorias nos filtros e na descoberta por categorias.
  [PR #83](https://github.com/lumamontes/biblioteca-de-zines/pull/83)

## 2025-07-01

### Adicionado

- **category management**: categorias, badges e seleção múltipla para o
  catálogo. [PR #74](https://github.com/lumamontes/biblioteca-de-zines/pull/74)

## 2025-06-20

### Adicionado

- **Feat/add apply zine form**: formulário próprio de submissão, validação,
  persistência e notificações. [PR #65](https://github.com/lumamontes/biblioteca-de-zines/pull/65)

## 2025-01-26

### Adicionado

- **add new tables to manage zines**: tabelas para estruturar o catálogo de
  zines. [PR #42](https://github.com/lumamontes/biblioteca-de-zines/pull/42)

## 2025-01-14

### Adicionado

- **feat: add supabase integration**: integração inicial com Supabase. [PR #14](https://github.com/lumamontes/biblioteca-de-zines/pull/14)

## 2025-01-12

### Adicionado

- **Start new project**: criação inicial do projeto Biblioteca de Zines.
  [commit b08b129](https://github.com/lumamontes/biblioteca-de-zines/commit/b08b129)
