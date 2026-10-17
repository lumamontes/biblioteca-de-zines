# Changelog

Este arquivo registra mudanças técnicas relevantes para pessoas que usam,
mantêm ou integram a Biblioteca de Zines. As entradas descrevem a diferença
observável entre estados do sistema; não são uma transcrição do histórico de
commits.

Seguimos a estrutura do [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
com as categorias traduzidas para pt-BR. O projeto ainda não publica versões
formais seguindo Semantic Versioning; por isso, cada seção usa a data em que a
mudança entrou em `main`. Mudanças ainda não incorporadas ficam em `Unreleased`.

## Unreleased

### Adicionado

- **Histórico editorial e changelog técnico**: a Biblioteca passa a ter uma
  linha do tempo pública para eventos e marcos do projeto, além de uma visão
  para pessoas interessadas na implementação. A visão técnica é renderizada
  diretamente deste arquivo, mantém as mudanças agrupadas pela unidade de
  trabalho que elas explicam e separa o que ainda não foi publicado. [commit 594a1f3](https://github.com/lumamontes/biblioteca-de-zines/commit/594a1f36dcd993c6ba206a1e8cae68d5c77927de)

- **Scaffold do futuro leitor isolado**: o monorepo passa a reservar um espaço
  próprio para uma aplicação de leitura, enquanto o catálogo continua em
  `apps/web`. Esta etapa organiza workspaces e fronteiras para que o runtime do
  BookReader possa ser desenvolvido separadamente; ela não significa que o
  viewer já esteja disponível em produção. A decisão arquitetural, incluindo os
  limites entre as aplicações e os contratos compartilhados, está registrada no
  ADR 14. [PR #158](https://github.com/lumamontes/biblioteca-de-zines/pull/158) [ADR 14](docs/decisions/14-monorepo.md)

- **Descoberta de autorias e links de apoio**: páginas de autorias passam a
  reconhecer mais plataformas, distinguir links de financiamento, mostrar
  previews quando há metadados disponíveis e organizar a lista por inicial.
  Isso torna mais fácil encontrar o trabalho de uma pessoa e seguir para a
  plataforma correta, sem tratar todos os links externos como se fossem iguais.
  [commit 6956df8](https://github.com/lumamontes/biblioteca-de-zines/commit/6956df8) [commit 526e729](https://github.com/lumamontes/biblioteca-de-zines/commit/526e729) [commit 4247fc1](https://github.com/lumamontes/biblioteca-de-zines/commit/4247fc1) [commit c196083](https://github.com/lumamontes/biblioteca-de-zines/commit/c196083) [commit 7ebbec2](https://github.com/lumamontes/biblioteca-de-zines/commit/7ebbec2) [commit c3dcc17](https://github.com/lumamontes/biblioteca-de-zines/commit/c3dcc17)

## 2026-10-17

### Adicionado

- **Observações de metadados das fontes**: ao adquirir um arquivo, a Biblioteca
  passa a registrar separadamente o que veio da fonte e o que foi observado pelo
  sistema. Para PDFs, isso inclui tipo declarado e detectado, identificação do
  formato, tamanho recebido, páginas e orientação, metadados incorporados,
  camada de texto, resultado da extração e hash SHA-256 para comparação de
  fixidade. Fontes inacessíveis, arquivos que não são PDF, PDFs protegidos e
  falhas de extração também recebem resultados explícitos, em vez de parecerem
  simplesmente ausentes. As observações permanecem internas e não substituem
  automaticamente os metadados editoriais do catálogo. [PR #167](https://github.com/lumamontes/biblioteca-de-zines/pull/167) [commit 2a5894c](https://github.com/lumamontes/biblioteca-de-zines/commit/2a5894c) [commit d8684aa](https://github.com/lumamontes/biblioteca-de-zines/commit/d8684aa)

## 2026-10-12

### Adicionado

- **Geração de derivados de páginas**: publicações aprovadas podem gerar uma
  cópia de leitura com todas as páginas do PDF, além da capa derivada. O fluxo
  executa de forma assíncrona, pode ser repetido com segurança, registra o
  estado do processamento, tenta novamente operações recuperáveis e só expõe a
  geração depois que ela está completa. Esta é a infraestrutura de processamento
  publicada; não é uma afirmação de que o novo viewer já está disponível. [PR #134](https://github.com/lumamontes/biblioteca-de-zines/pull/134) [PR #143](https://github.com/lumamontes/biblioteca-de-zines/pull/143)

### Descontinuado

- **Processamento somente da capa como fluxo principal**: gerar apenas uma capa
  WebP a partir da primeira página deixa de ser a estratégia principal para
  novas publicações. O comportamento continua disponível para compatibilidade e
  migração de capas antigas, enquanto a infraestrutura nova usa gerações
  completas de páginas. [ADR 12](docs/decisions/12-cover-only-processing-at-publication.md)

## 2026-09-23

### Adicionado

- **Inventário reproduzível do acervo**: a equipe pode comparar registros do
  catálogo, arquivos locais e evidências das fontes usando o mesmo procedimento
  em execuções diferentes. Isso transforma uma checagem manual e difícil de
  repetir em uma base para investigar arquivos ausentes, divergências e
  mudanças no acervo. [PR #127](https://github.com/lumamontes/biblioteca-de-zines/pull/127)

## 2026-09-13

### Adicionado

- **Monitoramento de PDFs publicados**: um workflow verifica os PDFs associados
  ao catálogo a partir do Supabase e produz evidências sobre o que precisa ser
  processado ou investigado. A operação deixa de depender apenas de alguém
  lembrar quais publicações foram alteradas. [PR #101](https://github.com/lumamontes/biblioteca-de-zines/pull/101)

## 2025-12-21

### Adicionado

- **Páginas e navegação de autorias**: autorias publicadas ganharam URLs
  próprias, e a listagem passou a ser paginada para continuar utilizável quando
  o catálogo cresce. [PR #94](https://github.com/lumamontes/biblioteca-de-zines/pull/94)

### Segurança

- **Atualização de React Server Components**: vulnerabilidades conhecidas no
  conjunto de dependências de React Server Components foram corrigidas, evitando
  manter a aplicação em versões afetadas. [PR #95](https://github.com/lumamontes/biblioteca-de-zines/pull/95)

## 2025-07-09

### Adicionado

- **Filtros por categoria**: o catálogo passou a combinar filtros de categorias
  para que uma pessoa consiga restringir a busca sem depender apenas da
  navegação por páginas. [PR #83](https://github.com/lumamontes/biblioteca-de-zines/pull/83)

## 2025-07-01

### Adicionado

- **Categorias para organizar o catálogo**: zines podem receber categorias e
  badges, e a interface administrativa permite selecionar mais de uma categoria
  ao mesmo tempo. Isso cria uma estrutura de descoberta que não depende de uma
  única classificação textual. [PR #74](https://github.com/lumamontes/biblioteca-de-zines/pull/74)

## 2025-06-20

### Adicionado

- **Formulário de submissão de zines**: pessoas podem enviar um zine pelo site
  com os dados necessários para revisão. O formulário valida a entrada, guarda a
  submissão e notifica a equipe, substituindo o encaminhamento manual dessas
  informações. [PR #65](https://github.com/lumamontes/biblioteca-de-zines/pull/65)

## 2025-01-26

### Adicionado

- **Modelo persistente para zines**: o catálogo ganhou tabelas próprias para
  separar zines, autorias, publicações e o estado de cada registro. Essa base
  permitiu deixar de tratar o acervo como uma coleção de links soltos e criar
  operações de administração sobre os dados. [PR #42](https://github.com/lumamontes/biblioteca-de-zines/pull/42)

## 2025-01-14

### Adicionado

- **Integração inicial com Supabase**: a aplicação passou a usar o Supabase
  para persistir e consultar os dados do catálogo, estabelecendo a primeira
  fronteira entre a interface do site e o armazenamento do acervo. [PR #14](https://github.com/lumamontes/biblioteca-de-zines/pull/14)

## 2025-01-12

### Adicionado

- **Estrutura inicial do projeto**: criação da aplicação Biblioteca de Zines e
  da base sobre a qual o catálogo colaborativo seria desenvolvido. Esse ponto
  estabeleceu o primeiro lugar para reunir acervo, interface e futuras
  contribuições em vez de manter o projeto apenas como uma ideia distribuída.
  [commit b08b129](https://github.com/lumamontes/biblioteca-de-zines/commit/b08b129)
