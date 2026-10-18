# Ciclo de vida de arquivos derivados privados e públicos

**Decisão histórica. Substituída por [11-process-pages-at-publication](./11-process-pages-at-publication.md) e atualmente por [14-viewer-release-and-page-derivatives](./14-viewer-release-and-page-derivatives.md).**

## Contexto

A Biblioteca precisava preparar arquivos derivados para leitura sem expor arquivos
de submissões ainda em revisão. Também precisava manter uma versão pública estável
enquanto uma nova geração era processada.

## Decisão

Separar arquivos derivados privados e públicos em gerações imutáveis, com validação
antes da ativação e limpeza controlada de gerações antigas.

## Alternativas Consideradas

- **Usar apenas um bucket público:** rejeitado porque poderia expor derivados de
  submissões ainda não publicadas.
- **Usar URLs assinadas para tudo:** rejeitado porque complicaria cache, expiração
  e entrega do visualizador público.
- **Processar novamente a cada publicação:** rejeitado porque repetiria trabalho
  quando já existisse uma geração equivalente.

## Justificativa

A separação protegia materiais em revisão e permitia verificar uma geração antes de
substituir a versão ativa. A imutabilidade reduzia o risco de uma atualização deixar
o leitor sem um arquivo válido.

## Consequências

- Gerações privadas e públicas tinham fronteiras de armazenamento distintas.
- Arquivos públicos permaneciam estáveis durante a troca de gerações.
- A operação precisava controlar rejeição, retirada, retenção e limpeza.
- O modelo de dois buckets é histórico e não deve ser confundido com o fluxo atual.

## Links

- [Processamento de páginas e ciclo de vida de assets](../specs/page-processing-and-asset-lifecycle.md)
- [Lançamento do visualizador e imagens das páginas](./14-viewer-release-and-page-derivatives.md)
- [Runbook de processamento de páginas](../runbooks/page-processing.md)
