# Processar páginas na publicação

**Decisão histórica. O caminho atual do reader está documentado em [14-viewer-release-and-page-derivatives](./14-viewer-release-and-page-derivatives.md).**

## Contexto

Submissões em `form_uploads` são registros de entrada que aguardam revisão.
Processar essas submissões antes da publicação criaria derivados privados para
materiais que talvez nunca entrassem no acervo, além de adicionar um segundo
ciclo de armazenamento.

Ao mesmo tempo, uma publicação aprovada precisa de uma representação estável
para leitura, com páginas ordenadas, fallback e possibilidade de reprocessamento
quando o PDF muda.

## Decisão

Decidimos processar o PDF somente depois que uma submissão se tornar uma
publicação aprovada, criando uma geração completa de páginas e capa.

- Submissões não publicadas não criam derivados públicos.
- A publicação usa o PDF atualmente associado ao registro.
- Uma geração completa precisa ser armazenada antes de ser ativada.
- A geração ativa só muda depois que todas as páginas necessárias forem
  processadas com sucesso.
- Uma geração anterior continua ativa enquanto a substituta está sendo criada.
- A mesma fonte pode ser reutilizada quando a geração estiver completa e o PDF
  não tiver mudado.

## Alternativas Consideradas

### Processar durante a submissão

Seria possível mostrar previews mais cedo, mas criaria storage e limpeza para
materiais que podem ser rejeitados ou nunca publicados.

### Processar somente quando alguém abrir o reader

Reduziria o processamento inicial, mas deixaria a primeira leitura lenta,
complicaria concorrência e dificultaria controlar falhas e retries.

### Processar somente a capa

Foi usado como uma etapa intermediária para melhorar o catálogo antes do
viewer. Não atende à navegação página a página do reader e hoje é mantido apenas
para compatibilidade e migração legada.

## Justificativa

Processar na publicação equilibra custo, privacidade e experiência de leitura.
Evita criar derivados para submissões não aprovadas e permite que o viewer
receba um manifest completo, estável e cacheável.

## Consequências

- A publicação pode esperar o processamento assíncrono da geração.
- Falhas individuais precisam permitir retry e ser visíveis para a manutenção.
- O reader ganha páginas ordenadas, navegação própria e fallback para o PDF.
- Uma alteração no PDF precisa criar uma nova geração.
- A estratégia cover-only deixa de ser o fluxo principal e permanece como
  compatibilidade histórica.

## Links

- [Processamento de páginas e ciclo de vida de assets](../specs/page-processing-and-asset-lifecycle.md)
- [Release do viewer e derivados de páginas](./14-viewer-release-and-page-derivatives.md)
- [Runbook de processamento de páginas](../runbooks/page-processing.md)
