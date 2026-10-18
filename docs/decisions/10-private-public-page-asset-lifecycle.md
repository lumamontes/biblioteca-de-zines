# Ciclo de vida de assets de páginas privadas e públicas

**Substituída primeiro por [11-process-pages-at-publication](./11-process-pages-at-publication.md) e atualmente pela [decisão sobre o release do viewer](./14-viewer-release-and-page-derivatives.md).**

## Contexto

A Biblioteca precisava processar PDFs enviados em momentos diferentes do fluxo
de publicação. As submissões eram materiais privados de revisão, enquanto zines
publicadas precisavam de URLs públicas estáveis para entrega das páginas.

Também era necessário evitar que derivados de submissões não publicadas fossem
expostos, preservar uma geração publicada enquanto uma nova fosse processada e
limpar assets antigos sem apagar a única versão disponível.

## Decisão

Decidimos usar buckets privados e públicos separados, com gerações imutáveis
identificadas por UUID.

- `biblioteca-de-zines` armazenaria gerações privadas de submissões.
- `biblioteca-de-zines-pb` armazenaria gerações públicas de publicações.
- Uma geração privada completa e inalterada poderia ser copiada para o bucket
  público no momento da publicação.
- Um PDF alterado ou desconhecido deveria ser processado novamente.
- Objetos do R2 nunca deveriam ser sobrescritos no mesmo lugar.
- Gerações públicas permaneceriam disponíveis durante ciclos comuns de
  despublicação e republicação.
- Gerações privadas rejeitadas ou retiradas seriam retidas por 30 dias antes da
  limpeza.
- Uma capa ausente usaria a primeira página do PDF como fallback.

Esta decisão foi substituída pelo processamento de páginas na publicação e,
depois, pela arquitetura ativa do viewer. Ela permanece como registro histórico
das alternativas consideradas.

## Alternativas Consideradas

### Usar apenas um bucket público

Foi rejeitada porque derivados de submissões não publicadas poderiam se tornar
acessíveis publicamente.

### Usar um bucket privado com URLs assinadas

Seria possível, mas exigiria URLs assinadas em todo o reader público, além de
expiração, cache e operação mais complexos.

### Processar novamente a cada publicação

Foi rejeitada porque adicionaria downloads, tempo de execução, latência e novas
possibilidades de falha quando já existisse uma geração completa equivalente.

## Justificativa

A separação entre privado e público protegia materiais ainda em revisão e
permitia validar uma geração antes de ativá-la. A estratégia de gerações
imutáveis também reduzia o risco de uma atualização interrompida deixar o
reader sem um asset válido.

O fluxo atual do viewer mantém esses princípios, mas usa o contrato de geração
completa documentado na ADR 14.

## Consequências

- Assets de revisão tinham uma fronteira de armazenamento própria.
- A entrega pública usava um domínio estável.
- Sources inalteradas podiam ser reutilizadas sem novo processamento.
- Novas gerações podiam ser verificadas antes de substituir as ativas.
- A operação exigia estados explícitos para rejeição, retirada e limpeza.
- O modelo de dois buckets original não deve ser confundido com a configuração
  pública atual sem consultar a especificação ativa.

## Links

- [Processamento de páginas e ciclo de vida de assets](../specs/page-processing-and-asset-lifecycle.md)
- [Runbook de processamento de páginas](../runbooks/page-processing.md)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
