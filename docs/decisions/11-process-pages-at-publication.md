# Processar páginas na publicação

**Decisão histórica. O caminho atual está documentado em [14-viewer-release-and-page-derivatives](./14-viewer-release-and-page-derivatives.md).**

## Contexto

Submissões aguardam revisão e podem nunca entrar no acervo. Publicações aprovadas
precisam de uma representação estável para leitura, com páginas ordenadas,
fallback e possibilidade de reprocessamento.

## Decisão

Processar o PDF depois que a submissão se tornar uma publicação aprovada, criando
uma geração completa de páginas e capa antes de ativá-la.

## Alternativas Consideradas

- **Processar durante a submissão:** criaria derivados para materiais que poderiam
  ser rejeitados.
- **Processar na primeira leitura:** deixaria a primeira experiência lenta e
  dificultaria concorrência, retries e observabilidade.
- **Processar somente a capa:** foi uma etapa intermediária e não atende ao reader
  página a página.

## Justificativa

Processar na publicação equilibra custo, privacidade e experiência de leitura.
Evita derivados públicos para submissões não aprovadas e permite ao viewer receber
um manifest completo, estável e cacheável.

## Consequências

- A publicação pode aguardar o processamento assíncrono da geração.
- Falhas precisam permitir retry e ser visíveis para manutenção.
- A geração anterior permanece ativa enquanto a substituta é criada.
- Alterações no PDF criam uma nova geração.
- O fluxo cover-only permanece apenas como histórico e migração.

## Links

- [Processamento de páginas e ciclo de vida de assets](../specs/page-processing-and-asset-lifecycle.md)
- [Release do viewer e imagens das páginas](./14-viewer-release-and-page-derivatives.md)
- [Runbook de processamento de páginas](../runbooks/page-processing.md)
