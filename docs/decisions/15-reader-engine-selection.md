# Seleção do mecanismo de leitura visual

**Status: aceita**

## Contexto

A Biblioteca precisava oferecer uma experiência de leitura com virada de páginas,
zoom, miniaturas e adaptação a diferentes telas sem transformar a aplicação
principal em uma implementação própria de todos esses recursos.

BookReader e PDF.js com StPageFlip/react-pageflip foram comparados tecnicamente e
testados com uma pessoa usuária real.

## Decisão

Usar o Internet Archive BookReader como mecanismo de leitura do beta e do caminho
de produção, por meio de um adaptador controlado pela Biblioteca dentro de um
visualizador isolado. O BookReader é uma dependência do visualizador, não um pacote
genérico.

## Alternativas Consideradas

- **PDF.js com StPageFlip/react-pageflip:** tecnicamente viável, mas a experiência
  com a pessoa usuária favoreceu BookReader e exigiria construir mais controles e
  comportamentos na Biblioteca.
- **PDF.js/react-pdf:** oferece renderização e controle fino, mas não entrega a
  experiência completa de page-turn selecionada.
- **Implementação própria com Three.js:** ofereceria controle visual, mas criaria
  uma responsabilidade grande de implementação e manutenção.

## Justificativa

O BookReader já oferece virada de páginas, visualização em duas páginas, zoom,
miniaturas e navegação, e recebe diretamente o manifesto que a Biblioteca produz:
páginas ordenadas com número, URL, largura e altura. O teste de experiência também
favoreceu essa opção.

## Consequências

- A Biblioteca mantém catálogo, acesso, manifesto, processamento, alternativa de
  leitura e incorporação.
- O adaptador controla inicialização, navegação, eventos, redimensionamento e
  limpeza.
- O runtime legado baseado em jQuery e CSS global permanece isolado.
- O adaptador permite trocar o mecanismo sem alterar o contrato público do leitor.
- A dependência AGPL-3.0 exige revisão legal e de distribuição.
- A experiência precisa ser avaliada antes da expansão geral.

## Links

- [BookReader e derivados](./13-internet-archive-bookreader-page-derivatives.md)
- [Lançamento do visualizador e imagens das páginas](./14-viewer-release-and-page-derivatives.md)
- [Caminho de leitura com BookReader](../specs/bookreader-reading-path.md)
- [Visualizador e incorporação isolados](../specs/isolated-bookreader-viewer-and-embed.md)
- [Findings do spike anterior](../spikes/visual-publication-reader-findings.md)
- [Internet Archive BookReader](https://github.com/internetarchive/bookreader)
