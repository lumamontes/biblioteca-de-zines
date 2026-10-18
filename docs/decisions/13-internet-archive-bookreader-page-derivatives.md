# Internet Archive BookReader com imagens das páginas

**Decisão incorporada pela [decisão sobre o release do viewer](./14-viewer-release-and-page-derivatives.md).**

## Contexto

A Biblioteca precisava de um reader interativo para zines. O BookReader era um
candidato forte porque recebe uma lista ordenada de imagens de páginas com suas
dimensões, enquanto o PDF continua necessário como fallback e download.

## Decisão

Integrar o Internet Archive BookReader atrás de um adapter controlado pela
Biblioteca, usando derivados de páginas gerados de forma assíncrona.

## Alternativas Consideradas

- **Manter o iframe de PDF:** mais barato, mas sem navegação por páginas controlada
  pela Biblioteca.
- **Renderizar no navegador:** evitaria storage, mas repetiria parsing e renderização
  em cada dispositivo.
- **Gerar páginas na primeira leitura:** tornaria a primeira leitura lenta e criaria
  picos de concorrência.
- **Manter o BookReader como package ou criar um fork:** adicionaria manutenção sem
  uma necessidade atual.

## Justificativa

Derivados pré-gerados reduzem parsing e rasterização em cada sessão. O adapter
mantém os contratos de catálogo, acesso, fallback e publicação sob controle da
Biblioteca sem transformar o BookReader em package genérico.

## Consequências

- O BookReader recebe páginas ordenadas, dimensões e URLs imutáveis.
- O PDF permanece como representação de leitura, download e fallback.
- A Biblioteca precisa operar processamento assíncrono, retries e gerações.
- Imagens rasterizadas não preservam todas as semânticas nativas do PDF.
- A dependência AGPL-3.0 exige revisão legal e de distribuição.

## Links

- [Inventário de derivados de leitura](../spikes/reading-derivative-inventory/report.md)
- [Benchmark de renderização](../spikes/reading-derivative-inventory/benchmark.md)
- [Caminho de leitura com BookReader](../specs/bookreader-reading-path.md)
- [Release do viewer e imagens das páginas](./14-viewer-release-and-page-derivatives.md)
- [Internet Archive BookReader](https://github.com/internetarchive/bookreader)
