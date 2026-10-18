# Monorepo para o catálogo e o visualizador

Situação: implementada.

## Contexto

O catálogo e o visualizador precisam evoluir com configurações e deploys
independentes, mas ainda compartilham contratos e histórico de desenvolvimento.

## Decisão

Decidimos manter as duas aplicações no mesmo monorepo, gerenciado por pnpm:

- `apps/web` mantém o catálogo e os workers;
- `apps/viewer` mantém o visualizador isolado;
- cada aplicação mantém suas próprias dependências, configurações e deploy;
- tipos e contratos compartilhados ficam em `packages/` quando necessário.

## Alternativas Consideradas

- **Usar repositórios separados:** isolaria as aplicações, mas dificultaria o
  compartilhamento de contratos, histórico e mudanças coordenadas.
- **Manter tudo em uma aplicação:** simplificaria o repositório, mas misturaria
  o runtime do BookReader com o catálogo.

## Justificativa

O monorepo mantém as aplicações isoladas sem duplicar contratos ou perder o
histórico comum. Também permite alterar as duas partes em uma única mudança.

## Consequências

- O catálogo e o visualizador podem ser publicados de forma independente.
- O repositório precisa de configuração de workspace e regras claras de limites.
- O visualizador não deve importar dependências de servidor ou do Supabase do
  catálogo.

## Links

- [Decisão sobre o visualizador e as imagens das páginas](./14-viewer-release-and-page-derivatives.md)
- [Decisão sobre o BookReader](./13-internet-archive-bookreader-page-derivatives.md)
- [README do projeto](../../README.md)
