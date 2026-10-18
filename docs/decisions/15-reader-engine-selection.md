# Seleção do engine do reader visual

**Status: aceita**

## Contexto

A Biblioteca precisava de uma experiência de leitura com virada de páginas sem
transformar a aplicação principal em uma implementação própria de renderização,
navegação, zoom, thumbnails e comportamento responsivo.

BookReader e PDF.js com StPageFlip/react-pageflip foram comparados tecnicamente e
testados com uma pessoa usuária real.

## Decisão

Usar o Internet Archive BookReader como engine do reader beta e do caminho de
produção, por meio de um adapter controlado pela Biblioteca dentro de um viewer
isolado. O BookReader é uma dependência do viewer, não um package genérico.

## Alternativas Consideradas

- **PDF.js com StPageFlip/react-pageflip:** tecnicamente viável, mas a experiência
  com a pessoa usuária favoreceu BookReader e exigiria construir mais controles e
  comportamentos na Biblioteca.
- **PDF.js/react-pdf:** oferece renderização e controle fino, mas não entrega a
  experiência completa de page-turn selecionada.
- **Implementação própria com Three.js:** ofereceria controle visual, mas criaria
  uma responsabilidade grande de implementação e manutenção.

## Justificativa

BookReader já oferece virada de páginas, spreads, zoom, thumbnails e navegação, e
recebe diretamente o manifest que a Biblioteca produz: páginas ordenadas com número,
URL, largura e altura. O teste de experiência também favoreceu essa opção.

## Consequências

- A Biblioteca mantém catálogo, acesso, manifest, processamento, fallback e embed.
- O adapter controla inicialização, navegação, eventos, resize e limpeza.
- O runtime legado baseado em jQuery e CSS global permanece isolado.
- O adapter permite trocar o engine sem alterar o contrato público do reader.
- A dependência AGPL-3.0 exige revisão legal e de distribuição.
- A experiência precisa ser avaliada antes da expansão geral.

## Links

- [BookReader e derivados](./13-internet-archive-bookreader-page-derivatives.md)
- [Release do viewer e imagens das páginas](./14-viewer-release-and-page-derivatives.md)
- [Caminho de leitura com BookReader](../specs/bookreader-reading-path.md)
- [Viewer e embed isolados](../specs/isolated-bookreader-viewer-and-embed.md)
- [Findings do spike anterior](../spikes/visual-publication-reader-findings.md)
- [Internet Archive BookReader](https://github.com/internetarchive/bookreader)
