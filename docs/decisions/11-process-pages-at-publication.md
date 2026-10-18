# Processar páginas na publicação

**Decisão histórica. O caminho atual está documentado em [14-viewer-release-and-page-derivatives](./14-viewer-release-and-page-derivatives.md).**

## Contexto

Uma submissão pode ser rejeitada e, portanto, não deve gerar páginas públicas antes
da publicação. Depois da aprovação, a pessoa leitora precisa de uma representação
  estável, com páginas ordenadas, uma alternativa em PDF e possibilidade de
  reprocessamento.

## Decisão

Processar o PDF depois que a submissão se tornar uma publicação aprovada, criando
uma geração completa de páginas e capa antes de ativá-la.

## Alternativas Consideradas

- **Processar durante a submissão:** criaria derivados para materiais que poderiam
  ser rejeitados.
- **Processar na primeira leitura:** deixaria a primeira experiência lenta e
  dificultaria a concorrência, novas tentativas e o acompanhamento das falhas.
- **Processar somente a capa:** foi uma etapa intermediária e não atende ao leitor
  página a página.

## Justificativa

Processar na publicação equilibra custo, privacidade e experiência de leitura.
Evita derivados públicos para submissões não aprovadas e permite ao visualizador
receber um manifesto completo, estável e cacheável.

## Consequências

- A publicação pode aguardar o processamento assíncrono da geração.
- Falhas precisam permitir novas tentativas e ser visíveis para manutenção.
- A geração anterior permanece ativa enquanto a substituta é criada.
- Alterações no PDF criam uma nova geração.
- O fluxo cover-only permanece apenas como histórico e migração.

## Links

- [Processamento de páginas e ciclo de vida de assets](../specs/page-processing-and-asset-lifecycle.md)
- [Lançamento do visualizador e imagens das páginas](./14-viewer-release-and-page-derivatives.md)
- [Runbook de processamento de páginas](../runbooks/page-processing.md)
