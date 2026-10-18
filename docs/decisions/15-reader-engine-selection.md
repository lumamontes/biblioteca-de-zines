# Seleção do engine do reader visual

**Status: aceita**

## Contexto

A Biblioteca de Zines precisava de uma experiência de leitura com virada de
páginas, sem transformar a aplicação principal em uma implementação própria de
renderização, navegação, zoom, thumbnails, fallback e comportamento responsivo.

Foram consideradas e experimentadas duas direções principais:

- Internet Archive BookReader, integrado sobre derivados ordenados de páginas;
- PDF.js com StPageFlip/react-pageflip, usando páginas renderizadas como
  superfícies para uma experiência de page-turn.

O spike técnico registrou que a direção PDF.js/StPageFlip era viável, incluindo
renderização direta de PDF, páginas ordenadas, navegação e comportamento em
viewport móvel. A decisão final, porém, não foi tomada apenas pelo resultado
técnico: as duas experiências foram testadas com uma pessoa usuária real, e o
BookReader foi preferido.

## Decisão

O Internet Archive BookReader é o engine selecionado para o reader beta e para o
caminho de produção da Biblioteca.

O BookReader será usado através de um adapter controlado pela Biblioteca, dentro
de um viewer isolado. A aplicação continua responsável por catálogo, acesso,
manifest, processamento, fallback PDF, rollout e embed. O BookReader continua
sendo uma dependência de runtime do viewer, não um package genérico mantido pela
Biblioteca.

O caminho de leitura é:

```text
publicação aprovada
  -> processamento assíncrono do PDF
  -> geração completa e imutável de páginas
  -> manifest ordenado com URLs e dimensões
  -> viewer isolado
  -> Internet Archive BookReader
```

## Evidência da escolha

- A experiência com BookReader foi comparada com a alternativa de page-turn
  baseada em PDF.js/StPageFlip/react-pageflip.
- O teste com pessoa usuária real favoreceu BookReader.
- BookReader já oferece o conjunto de interação necessário para a hipótese
  escolhida: virada de páginas, spreads, zoom, thumbnails, navegação e
  carregamento de páginas próximas.
- O BookReader recebe diretamente a representação que a Biblioteca passou a
  produzir: imagens ordenadas com `pageNumber`, `imageUrl`, `width` e `height`.
- O PDF continua disponível como representação original, download e fallback.

## Alternativas consideradas

### PDF.js com StPageFlip/react-pageflip

O spike demonstrou que essa combinação é tecnicamente viável:

- PDF.js carregou e renderizou um PDF diretamente no browser;
- páginas de PDF puderam alimentar uma superfície de page-turn;
- páginas de imagem ordenadas também puderam alimentar a mesma superfície;
- a navegação e a troca entre modos funcionaram no fixture testado;
- o comportamento em viewport de 390px foi exercitado.

Ela não foi selecionada porque o teste de experiência com pessoa usuária
favoreceu BookReader. A implementação exigiria ainda uma superfície própria para
controles, lifecycle, fallback, acessibilidade, memória e comportamento de
dispositivo.

O resultado técnico do spike permanece documentado em
[`visual-publication-reader-findings.md`](../spikes/visual-publication-reader-findings.md)
para consulta histórica. Ele não é a recomendação ativa do projeto.

### PDF.js/react-pdf como reader principal

É uma direção válida para renderização PDF e pode oferecer canvas, texto,
anotações, thumbnails e controle fino. Porém, a biblioteca fornece uma camada
de renderização, não a experiência completa de page-turn selecionada neste
release. Adotá-la como reader principal deslocaria para a Biblioteca a
construção da interação que BookReader já fornece.

### Implementação própria com Three.js

Daria controle máximo sobre a estética, física e composição da virada de
páginas. Também faria a Biblioteca assumir a implementação e manutenção de
malhas, texturas, carregamento, navegação, acessibilidade, teclado, reduced
motion, mobile, memória e performance. Não foi selecionada depois do teste das
alternativas existentes.

## Consequências

### Positivas

- A decisão preserva o resultado do teste com pessoa usuária.
- A Biblioteca não precisa implementar page-turn do zero.
- O viewer recebe uma representação eficiente para leitura: derivados de
  páginas versionados e cacheáveis.
- O BookReader fica isolado do documento principal e de seus estilos e eventos.
- O adapter mantém a possibilidade de substituir o engine sem alterar o
  contrato público do reader.
- O PDF permanece como fallback explícito.

### Negativas e responsabilidades

- BookReader é um runtime legado baseado em jQuery e CSS global, por isso deve
  permanecer isolado no viewer.
- O adapter precisa controlar inicialização, resize, navegação, eventos e
  limpeza.
- A Biblioteca precisa manter geração assíncrona, retries, ativação completa,
  armazenamento imutável e observabilidade.
- A dependência AGPL-3.0 exige revisão legal e de distribuição.
- A experiência precisa ser avaliada em cohorts de desktop, mobile, publicações
  curtas, longas e image-heavy antes de expansão geral.

## Documentos relacionados

- [Decisão sobre BookReader e derivados](./13-internet-archive-bookreader-page-derivatives.md)
- [Release do viewer e imagens das páginas](./14-viewer-release-and-page-derivatives.md)
- [BookReader Reading Path](../specs/bookreader-reading-path.md)
- [Viewer beta](../operations/bookreader-viewer-beta.md)
- [Avaliação do viewer beta](../operations/bookreader-viewer-beta-evaluation.md)
- [Viewer e embed isolados](../specs/isolated-bookreader-viewer-and-embed.md)
- [Findings do spike anterior](../spikes/visual-publication-reader-findings.md)
- [PR #135: spike visual](https://github.com/lumamontes/biblioteca-de-zines/pull/135)
- [PR #157: nova experiência de reader](https://github.com/lumamontes/biblioteca-de-zines/pull/157)
- [PR #158: viewer isolado no monorepo](https://github.com/lumamontes/biblioteca-de-zines/pull/158)
