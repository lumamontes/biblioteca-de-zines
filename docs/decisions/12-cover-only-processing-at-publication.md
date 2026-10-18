# Processar somente a capa na publicação

**Decisão histórica. Substituída como fluxo principal por [14-viewer-release-and-page-derivatives](./14-viewer-release-and-page-derivatives.md).**

## Contexto

Antes do viewer, o catálogo precisava de uma capa confiável quando a submissão não
possuía uma imagem válida. O preview externo de PDF ainda era o reader principal.

## Decisão

Gerar somente uma capa WebP a partir da primeira página do PDF durante a etapa
intermediária anterior ao reader completo.

## Alternativas Consideradas

- **Processar todas as páginas:** adicionaria custo e armazenamento para uma
  capacidade que o reader ainda não consumia.
- **Manter somente o placeholder:** seria mais simples, mas prejudicaria a
  identificação visual das publicações.

## Justificativa

O fluxo cover-only era pequeno, barato e reversível. Melhorava a descoberta do
catálogo sem tratar uma capa como cópia de preservação ou reader completo.

## Consequências

- O catálogo passou a ter capas geradas e otimizadas para web.
- O processamento completo permaneceu separado para o futuro reader.
- A migração de capas existentes ainda pode usar esse fluxo histórico.
- O viewer atual deve seguir gerações completas, não esta decisão.

## Links

- [Geração e migração histórica de capas](../specs/cover-only-generation-and-migration.md)
- [Release do viewer e imagens das páginas](./14-viewer-release-and-page-derivatives.md)
