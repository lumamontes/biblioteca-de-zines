# Processar somente a capa na publicação

**Decisão histórica. Substituída como fluxo principal pela [decisão sobre o visualizador e as imagens das páginas](./14-viewer-release-and-page-derivatives.md).**

## Contexto

Antes da implementação do visualizador, o catálogo precisava de uma capa confiável para ajudar a pessoa
leitora a identificar cada zine quando a submissão não possuía uma imagem válida.
O preview externo de PDF ainda era a forma principal de leitura.

## Decisão

Gerar somente uma capa WebP a partir da primeira página do PDF durante a etapa
intermediária anterior ao leitor completo.

## Alternativas Consideradas

- **Processar todas as páginas:** adicionaria custo e armazenamento para uma
  capacidade que o leitor ainda não utilizava.
- **Manter somente o placeholder:** seria mais simples, mas prejudicaria a
  identificação visual das publicações.

## Justificativa

O fluxo de geração somente da capa era pequeno, barato e reversível. Melhorava a
descoberta do catálogo sem tratar uma capa como cópia de preservação ou leitor
completo.

## Consequências

- O catálogo passou a ter capas geradas e otimizadas para web.
- O processamento completo permaneceu separado para o futuro leitor.
- A migração de capas existentes ainda pode usar esse fluxo histórico.
- O visualizador atual deve seguir gerações completas, não esta decisão.

## Links

- [Geração e migração histórica de capas](../specs/cover-only-generation-and-migration.md)
- [Lançamento do visualizador e imagens das páginas](./14-viewer-release-and-page-derivatives.md)
