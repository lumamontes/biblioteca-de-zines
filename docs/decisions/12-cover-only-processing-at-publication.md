# Processar somente a capa na publicação

**Decisão histórica. Substituída como fluxo principal por [14-viewer-release-and-page-derivatives](./14-viewer-release-and-page-derivatives.md).**

## Contexto

Antes do viewer, a Biblioteca usava o preview de PDF do Google Drive. O catálogo
precisava de uma capa confiável quando a submissão não possuía uma imagem válida,
mas ainda não utilizava páginas hospedadas pela própria Biblioteca.

Processar somente a primeira página era uma forma menor e mais barata de
melhorar as capas enquanto o reader completo ainda não estava disponível.

## Decisão

Durante essa etapa intermediária, decidimos gerar apenas uma capa WebP a partir
da primeira página do PDF.

- Uma capa enviada e válida permanecia como referência principal.
- Uma capa vazia, placeholder ou inacessível podia ser substituída.
- A geração usava um namespace imutável no R2.
- A capa nova era armazenada antes da atualização do registro do catálogo.
- Uma falha não substituía a capa anterior.
- O mesmo PDF e uma geração completa podiam ser reutilizados.
- A geração completa de páginas ficava separada para o futuro reader.

## Alternativas Consideradas

### Processar todas as páginas imediatamente

Naquele momento, isso adicionaria downloads, computação, storage e limpeza para
uma capacidade que o reader ainda não consumia.

### Manter somente o placeholder

Seria mais simples, mas não aproveitaria a primeira página de PDFs que já
estavam disponíveis e prejudicaria a identificação visual das publicações.

## Justificativa

O fluxo cover-only era uma etapa intermediária pequena, reversível e barata. Ele
melhorava a descoberta do catálogo sem fingir que uma capa era uma cópia de
preservação ou um reader completo.

## Consequências

- A Biblioteca passou a ter capas geradas e otimizadas para web.
- O processamento completo de páginas permaneceu como infraestrutura separada.
- O reader antigo continuou dependendo do preview externo.
- A migração de capas existentes pode continuar usando este fluxo legado.
- O viewer atual deve seguir a especificação de gerações completas, não esta
  decisão histórica.

## Links

- [Geração e migração histórica de capas](../specs/cover-only-generation-and-migration.md)
- [Release do viewer e imagens das páginas](./14-viewer-release-and-page-derivatives.md)
- [Internet Archive BookReader](https://github.com/internetarchive/bookreader)
