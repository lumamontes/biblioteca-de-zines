# Internet Archive BookReader com imagens das páginas

**Decisão incorporada pela [decisão sobre o release do viewer](./14-viewer-release-and-page-derivatives.md).**

## Contexto

A Biblioteca precisava de um reader interativo para zines publicadas. O Internet
Archive BookReader foi escolhido como o candidato mais forte entre os engines
avaliados porque recebe uma lista ordenada de imagens de páginas com suas
dimensões.

O BookReader não substitui diretamente o preview de PDF. O reader da Biblioteca
precisa manter seus próprios contratos de catálogo, acesso, fallback e ciclo de
vida de publicação.

O inventário possui 309 PDFs públicos e 3.242 páginas. Um benchmark gerou 16,1
MB de WebP para 187 páginas representativas, com média de 86 KB por página. O
processamento serial estimado de todo o acervo levou aproximadamente 45,8
minutos, então o trabalho precisa ser assíncrono e permitir retry.

## Decisão

Decidimos integrar o Internet Archive BookReader como uma funcionalidade da
Biblioteca, atrás de um adapter controlado pelo projeto. O BookReader não será
mantido como um package genérico reutilizável.

O caminho do reader é:

```text
publicação aprovada
  -> processamento assíncrono do PDF
  -> geração completa e imutável de páginas
  -> manifest ordenado de imagens
  -> Internet Archive BookReader
```

- O PDF continua disponível como representação de leitura, download e fallback.
- Imagens de páginas são derivados de leitura, não substitutos do PDF original
  nem evidência de direitos.
- O processamento começa apenas para uma publicação pública aprovada.
- A geração só fica ativa depois que todas as páginas necessárias forem
  processadas.
- URLs de páginas são imutáveis e versionadas pela geração.
- O BookReader recebe número da página, URL, largura e altura.
- O adapter cuida da inicialização, navegação, eventos e limpeza do BookReader.
- A aplicação continua responsável por catálogo, acesso, fallback e publicação.

## Alternativas Consideradas

### Manter o iframe de PDF como reader principal

Seria a opção mais barata e continua sendo um fallback necessário, mas não
oferece navegação por páginas controlada pela Biblioteca nem comportamento mobile
previsível.

### Renderizar todas as páginas no navegador

Evitaria storage de derivados, mas repetiria parsing e renderização em cada
dispositivo. Também não produziria o manifest de imagens esperado pelo
BookReader.

### Gerar páginas na primeira leitura

Reduziria o processamento inicial, mas tornaria a primeira leitura lenta e
criaria picos de concorrência e problemas de retry.

### Manter o BookReader como package independente

Preservaria uma fronteira genérica, mas adicionaria manutenção sem uma
necessidade atual da comunidade. O adapter pertence à aplicação da Biblioteca.

### Criar um fork do BookReader

Daria mais controle, mas transferiria para a Biblioteca a manutenção de
renderização, acessibilidade e segurança do projeto upstream.

## Justificativa

Derivados pré-gerados tiram o parsing e a rasterização repetidos de cada sessão
de leitura. URLs imutáveis podem ser reutilizadas pelo CDN, enquanto cada
navegador administra sua própria memória.

Manter o PDF como fallback preserva um caminho simples para leitura e download
quando o processamento falha ou quando a pessoa prefere o arquivo original.

## Consequências

- O BookReader oferece páginas ordenadas, spreads, zoom, thumbnails e
  carregamento de páginas próximas.
- Dispositivos móveis fazem menos parsing e renderização de PDF.
- URLs imutáveis podem ser cacheadas entre diferentes leitores.
- O PDF continua disponível como fallback e representação de download.
- A Biblioteca precisa operar jobs assíncronos, retries e limpeza de gerações.
- Imagens rasterizadas não preservam semânticas nativas do PDF, como texto
  selecionável, links e anotações.
- A dependência AGPL-3.0 precisa passar por revisão legal e de distribuição.

## Links

- [Inventário de derivados de leitura](../spikes/reading-derivative-inventory/report.md)
- [Benchmark de renderização](../spikes/reading-derivative-inventory/benchmark.md)
- [Caminho de leitura com BookReader](../specs/bookreader-reading-path.md)
- [Processamento de páginas e ciclo de vida de assets](../specs/page-processing-and-asset-lifecycle.md)
- [Release do viewer e imagens das páginas](./14-viewer-release-and-page-derivatives.md)
- [Internet Archive BookReader](https://github.com/internetarchive/bookreader)
