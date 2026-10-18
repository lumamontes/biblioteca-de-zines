# Lançamento do visualizador e imagens das páginas

**Substitui [12-cover-only-processing-at-publication](./12-cover-only-processing-at-publication.md) e atualiza o caminho definido em [13-internet-archive-bookreader-page-derivatives](./13-internet-archive-bookreader-page-derivatives.md).**

Situação: implementada no monorepo. O visualizador está deployável e habilitável
para beta por flag; o rollout público continua pausado.

## Contexto

A Biblioteca quer oferecer uma experiência de leitura mais confortável e previsível
para as zines, sem depender apenas do preview externo de PDF. O novo visualizador
precisa de páginas ordenadas, dimensões conhecidas e uma alternativa confiável de
leitura em PDF.

## Decisão

Processar PDFs de publicações aprovadas de forma assíncrona em gerações completas
de páginas e capa. Ativar uma geração somente depois que todos os derivados forem
processados com sucesso e servir a leitura pelo visualizador isolado.

- O PDF continua sendo a referência de origem e a alternativa de leitura.
- Derivados de páginas são imutáveis e não são prova de direitos.
- Submissões não publicadas não criam derivados públicos.
- Uma geração incompleta não substitui a geração ativa anterior.
- O leitor principal usa `/p/:slug` e o leitor incorporado usa `/embed/p/:slug`,
  sempre com o slug canônico, nunca o ID interno.

## Alternativas Consideradas

- **Processar durante a submissão:** criaria derivados para materiais que poderiam
  não ser publicados.
- **Gerar páginas na primeira leitura:** deixaria a primeira experiência lenta e
  dificultaria a concorrência e novas tentativas.
- **Manter somente o preview externo de PDF:** não ofereceria navegação por páginas
  controlada pela Biblioteca.
- **Adicionar upload direto agora:** misturaria a entrega do visualizador com decisões
  ainda abertas sobre preservação, direitos, retenção e metadados.

## Justificativa

O processamento assíncrono na publicação move o trabalho pesado para fora da
leitura, permite cache de URLs imutáveis e mantém o custo controlado. Separar essa
entrega do upload direto permite testar o visualizador sem fechar decisões de
preservação e direitos.

## Consequências

- O visualizador recebe um manifesto completo e estável.
- Processamentos assíncronos, novas tentativas e limpeza de gerações fazem parte da
  operação.
- O PDF permanece disponível como alternativa de leitura e download.
- O rollout depende de revisão legal, operacional e avaliação controlada.
- O fluxo atual ainda usa uma URL externa de PDF; upload direto é uma decisão futura.

## Links

- [Processamento de páginas e ciclo de vida de assets](../specs/page-processing-and-asset-lifecycle.md)
- [Viewer e embed isolados](../specs/isolated-bookreader-viewer-and-embed.md)
- [Operação do beta do visualizador](../operations/bookreader-viewer-beta.md)
- [Decisão sobre o BookReader](./13-internet-archive-bookreader-page-derivatives.md)
- [Versão posterior de upload direto](../specs/direct-upload-and-metadata-intake.md)
