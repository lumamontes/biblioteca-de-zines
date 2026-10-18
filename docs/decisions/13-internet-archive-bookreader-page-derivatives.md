# Internet Archive BookReader com imagens das páginas

**Decisão incorporada pela [decisão sobre o visualizador e as imagens das páginas](./14-viewer-release-and-page-derivatives.md).**

## Contexto

A Biblioteca precisava oferecer uma experiência de leitura mais confortável e
previsível para o conteúdo das zines. O preview externo de PDF não dava à aplicação
controle suficiente sobre a navegação por páginas e a adaptação a diferentes telas.
Por isso, era necessário adotar uma biblioteca de leitura de páginas e manter o PDF
como alternativa de leitura e opção de download.

## Decisão

Integrar o Internet Archive BookReader, uma biblioteca de leitura de páginas, por
meio de um adaptador controlado pela Biblioteca e usando derivados de páginas
gerados de forma assíncrona.

## Alternativas Consideradas

- **Manter o iframe de PDF:** mais barato, mas sem navegação por páginas controlada
  pela Biblioteca.
- **Renderizar no navegador:** evitaria armazenamento, mas repetiria a leitura e a
  renderização do PDF em cada dispositivo.
- **Gerar páginas na primeira leitura:** tornaria a primeira leitura lenta e criaria
  picos de concorrência.
- **Manter o BookReader como pacote ou criar um fork:** adicionaria manutenção sem
  uma necessidade atual.

## Justificativa

Derivados pré-gerados reduzem a leitura e a rasterização do PDF em cada sessão. O
adaptador mantém os contratos de catálogo, acesso, alternativa de leitura e
publicação sob controle da Biblioteca sem transformar o BookReader em pacote
genérico.

## Consequências

- O BookReader recebe páginas ordenadas, dimensões e URLs imutáveis.
- O PDF permanece como representação de leitura e download, além de alternativa
  quando as páginas não estão disponíveis.
- A Biblioteca precisa operar processamento assíncrono, novas tentativas e gerações.
- Imagens rasterizadas não preservam todas as semânticas nativas do PDF.
- A dependência AGPL-3.0 exige revisão legal e de distribuição.

## Links

- [Inventário de derivados de leitura](../spikes/reading-derivative-inventory/report.md)
- [Benchmark de renderização](../spikes/reading-derivative-inventory/benchmark.md)
- [Caminho de leitura com BookReader](../specs/bookreader-reading-path.md)
- [Lançamento do visualizador e imagens das páginas](./14-viewer-release-and-page-derivatives.md)
- [Internet Archive BookReader](https://github.com/internetarchive/bookreader)
