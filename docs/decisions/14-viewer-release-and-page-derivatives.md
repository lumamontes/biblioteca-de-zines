# Release do viewer e imagens das páginas

**Substitui [12-cover-only-processing-at-publication](./12-cover-only-processing-at-publication.md) e atualiza o caminho definido em [13-internet-archive-bookreader-page-derivatives](./13-internet-archive-bookreader-page-derivatives.md).**

Situação: decisão para a próxima versão do monorepo. Não descreve a produção
publicada atualmente.

## Contexto

A Biblioteca está saindo de uma experiência baseada no preview externo de PDF
para um reader controlado pelo próprio projeto, usando o Internet Archive
BookReader.

O BookReader precisa de um manifest ordenado de imagens de páginas com suas
dimensões. Ao mesmo tempo, o PDF continua sendo útil como fallback e como
representação de leitura ou download.

O monorepo já possui renderer de páginas, storage de gerações imutáveis,
ativação transacional, fila de processamento, contrato do reader e viewer
isolado. A antiga decisão de processamento somente de capas descrevia um estado
anterior e não deve mais ser tratada como o contrato operacional atual.

## Decisão

Para o release do viewer, publicações aprovadas serão processadas de forma
assíncrona em gerações completas de páginas.

```text
publicação pública aprovada
  -> aquisição do PDF de origem
  -> geração completa de páginas e capa
  -> assets imutáveis no R2
  -> ativação atômica da geração
  -> manifest público de páginas
  -> viewer BookReader
```

- O processamento começa somente depois que a submissão se torna uma publicação
  pública aprovada.
- Cada página vira um derivado de entrega com número, largura, altura e URL
  imutável.
- A primeira página fica disponível como fallback de capa.
- Uma geração só é ativada quando todas as páginas e a capa são processadas com
  sucesso.
- Uma geração incompleta ou com falha não substitui a geração ativa anterior.
- O PDF original continua sendo a referência de origem e o fallback do viewer.
  Derivados de páginas não são prova de direitos nem substituem um original
  autorizado.
- Submissões não publicadas não criam derivados públicos.
- O viewer pode voltar para o PDF quando o processamento ou a entrega das
  páginas estiver indisponível.

## Limite da submissão atual

O release do viewer continua aceitando o fluxo atual baseado em uma URL externa
de PDF. Upload direto, retenção privada do original e extração automática de
metadados ficam para uma versão posterior da submissão e do catálogo.

Essas capacidades precisam seguir a consulta comunitária e o fluxo de originais
autorizados. Elas não devem ser presumidas a partir do release do viewer.

O processamento dos derivados necessários para a leitura não é uma preferência
opcional da pessoa autora no fluxo padrão do viewer. A Biblioteca deve explicar
o processamento antes do envio e oferecer caminhos para correção e remoção. Uma
versão posterior deve substituir a dependência de URLs externas por upload direto
e armazenamento próprio do PDF, mantendo o mesmo princípio de transparência.

## Alternativas Consideradas

### Processar durante a submissão

Criaria derivados privados para materiais que talvez nunca fossem publicados e
exigiria um ciclo adicional de armazenamento e limpeza.

### Gerar páginas na primeira leitura

Deixaria a primeira experiência lenta, complicaria concorrência e poderia criar
picos de processamento difíceis de recuperar.

### Manter somente o preview externo de PDF

Seria mais simples, mas não ofereceria navegação por páginas, cache de imagens
ou comportamento previsível em dispositivos móveis.

### Adicionar upload direto agora

Resolveria a experiência de envio, mas misturaria o release do viewer com
decisões ainda abertas sobre preservação, direitos, retenção e metadados.

## Justificativa

O processamento assíncrono na publicação move o trabalho pesado para fora da
sessão de leitura, permite cache de URLs imutáveis e mantém o custo sob controle.

Separar esse release do upload direto também permite testar o viewer antes de
alterar as expectativas de quem envia zines e antes de concluir a consulta com a
comunidade.

## Consequências

- O viewer terá um manifest estável e navegação controlada pela Biblioteca.
- O processamento ficará fora da sessão de cada leitor.
- Assets imutáveis poderão ser cacheados e reutilizados.
- O PDF continuará disponível como fallback.
- Jobs assíncronos, retries e limpeza de gerações passam a ser parte da
  operação.
- Derivados de páginas não preservam todas as semânticas nativas do PDF.
- Entrega pública de páginas continua separada de decisões de preservação e
  direitos.
- O BookReader e o deployment ainda precisam de revisão legal e operacional
  antes de um rollout amplo.

## Links

- [Processamento de páginas e ciclo de vida de assets](../specs/page-processing-and-asset-lifecycle.md)
- [Decisão sobre o BookReader](./13-internet-archive-bookreader-page-derivatives.md)
- [Versão posterior de upload direto](../specs/direct-upload-and-metadata-intake.md)
- [Rascunho da consulta comunitária](../biblioteca-community-consultation-draft.md)
