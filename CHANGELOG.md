# Changelog

Este changelog registra mudanças relevantes no projeto segundo o formato
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Alterações ainda não
publicadas ficam em `Unreleased`; as demais são agrupadas pela data em que
entraram em `main` (UTC). Versões formais seguirão o
[Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Adicionado

- **Contadores operacionais do leitor**: a API agrega por dia, publicação e superfície as aberturas, falhas e ofertas de PDF. A equipe pode consultar o período desejado no Supabase e acompanhar as ocorrências sem registrar sessões individuais na tabela. Links antigos são atribuídos à publicação atual, falhas são contadas mesmo sem PDF e a API limita o tamanho dos eventos. A CI verifica em Chromium que o leitor oferece o PDF e registra os eventos esperados quando o BookReader falha ao iniciar.
  [Issue #190](https://github.com/lumamontes/biblioteca-de-zines/issues/190) [PR #200](https://github.com/lumamontes/biblioteca-de-zines/pull/200)

- **Verificação do leitor de produção**: a equipe pode executar um teste manual que confirma o carregamento da primeira imagem e a navegação no leitor direto e no incorporado ao catálogo. [Issue #206](https://github.com/lumamontes/biblioteca-de-zines/issues/206)

- **Relatório interno do leitor**: a equipe pode exportar contagens por zine e superfície em JSON ou Markdown. Um teste de navegador confere os contadores de falha e oferta de PDF com a migração num banco descartável. [Issue #205](https://github.com/lumamontes/biblioteca-de-zines/issues/205)

### Corrigido

- O monitor semanal volta a localizar a configuração de verificação dos recursos publicados após a reorganização do monorepo. [Issue #204](https://github.com/lumamontes/biblioteca-de-zines/issues/204)
### Alterado

- **Monitor semanal do leitor**: a equipe pode acompanhar a disponibilidade do leitor direto e do embed com um teste automático às segundas-feiras às 06h43 UTC, além de rodar a mesma verificação manualmente após mudanças no leitor. [Issue #206](https://github.com/lumamontes/biblioteca-de-zines/issues/206)

- **Diagnóstico de descoberta no catálogo**: A documentação reúne 17 fichas públicas e 20 buscas reproduzidas na Biblioteca. A equipe passa a ter uma base para comparar descrição, categorias e ordenação sem alterar a busca publicada.
  [Issue #202](https://github.com/lumamontes/biblioteca-de-zines/issues/202) [Issue #203](https://github.com/lumamontes/biblioteca-de-zines/issues/203)

- **Cronologia do catálogo e do leitor**: a página de novidades técnicas passa a distinguir a escolha do BookReader, a integração na Biblioteca e as correções posteriores. As datas registram a entrada na branch principal em UTC e os links permitem consultar cada entrega.
  [PR #199](https://github.com/lumamontes/biblioteca-de-zines/pull/199) [Histórico do changelog](https://github.com/lumamontes/biblioteca-de-zines/commits/main/CHANGELOG.md)

## 2026-11-07

### Corrigido

- **Correção das referências de mídia e dos ícones sociais**: A página inicial retirou a referência ao Zine Libraries cujo conteúdo não aparecia corretamente. Os ícones sociais passaram a usar endereços públicos e dimensões explícitas.
  [PR #196](https://github.com/lumamontes/biblioteca-de-zines/pull/196)

## 2026-11-06

### Adicionado

- **Novas menções na mídia**: a seção “Na Mídia” da página inicial passa a
  ampliar a visibilidade da Biblioteca e a reunir referências recentes sobre o
  acervo, sua proposta de catalogação e o acesso a publicações independentes,
  incluindo matérias do [Equinócio Play](https://equinocioplay.com.br/2026/10/19/uma-publicacao-pequena-no-formato-mas-gigante-nas-possibilidades-de-expressao/)
  e do [Portal Amazônia](https://portalamazonia.com/cultura/biblioteca-zines-independente-ap/).
  [PR #195](https://github.com/lumamontes/biblioteca-de-zines/pull/195)

## 2026-10-25

### Alterado

- **Ciclo de vida do visualizador isolado**: o carregamento de dados, o timeout e
  cancelamento de requests, a montagem da sessão do BookReader e a limpeza do
  runtime passam a ter responsabilidades mais explícitas. A configuração e os
  contratos do controlador também ficam separados em módulos próprios, com
  cobertura para timeout e cancelamento. [PR #194](https://github.com/lumamontes/biblioteca-de-zines/pull/194)

## 2026-10-24

### Corrigido

- **Recuperação quando a fonte de leitura está indisponível**: A página do zine oferece o PDF quando há um endereço válido. Quando nenhuma fonte de leitura está disponível, a página informa o problema e oferece uma nova tentativa.
  [PR #193](https://github.com/lumamontes/biblioteca-de-zines/pull/193)

## 2026-10-21

### Alterado

- **Novo layout em detalhamento de zines**: a página de detalhes passou a manter o
  PDF ou leitor digital em um painel principal no desktop, enquanto informações
  editoriais e controles ficam em uma coluna lateral recolhível. A lateral
  organiza os modos `Visualização de PDF` e `Leitura digital`, oferece as opções
  de ocupar a área ou mostrar a página inteira sem recarregar o PDF e reúne as
  ações do leitor digital. O embed usa o leitor sem preset, breadcrumbs longos
  são truncados com acesso ao título completo e telas pequenas mantêm um fluxo
  empilhado sem controles de recolhimento.
  [Issue #191](https://github.com/lumamontes/biblioteca-de-zines/issues/191) [PR #192](https://github.com/lumamontes/biblioteca-de-zines/pull/192)

- **Navegação social nas páginas de zines**: os links sociais fixos deixam de
  aparecer no desktop das páginas individuais de zines para não cobrir descrições
  longas nem competir com a leitura. Eles continuam disponíveis em outras páginas
  e seguem no fluxo normal em telas pequenas. [Issue #191](https://github.com/lumamontes/biblioteca-de-zines/issues/191) [PR #192](https://github.com/lumamontes/biblioteca-de-zines/pull/192)

## 2026-10-20

### Corrigido

- **Alinhamento das páginas de autoria**: As informações da pessoa autora passaram a usar a mesma largura máxima e os mesmos recuos do cabeçalho e da navegação, mantendo o conteúdo alinhado também em telas largas.
  [PR #183](https://github.com/lumamontes/biblioteca-de-zines/pull/183)

## 2026-10-18

### Adicionado

- **Versão do pnpm nos workflows**: A verificação do código e o fluxo de deploy do viewer passaram a usar a versão de pnpm indicada pelo repositório para manter a instalação das dependências consistente entre os ambientes.
  [PR #172](https://github.com/lumamontes/biblioteca-de-zines/pull/172)

- **Histórico das decisões do leitor**: Os registros de decisão passaram a situar o processamento de páginas, a escolha do leitor e a separação dos aplicativos no monorepo, preservando os vínculos com as decisões anteriores.
  [PR #173](https://github.com/lumamontes/biblioteca-de-zines/pull/173) [PR #179](https://github.com/lumamontes/biblioteca-de-zines/pull/179)

- **Observações de metadados das fontes**: ao adquirir o PDF externo associado a
  uma submissão ou publicação, a Biblioteca passa a registrar separadamente o
  que veio do arquivo e o que foi observado pelo sistema. Para PDFs, isso inclui
  tipo declarado e detectado, identificação do formato, tamanho recebido,
  páginas e orientação, metadados incorporados, camada de texto, resultado da
  extração e hash `SHA-256` para detectar alterações entre processamentos.
  Fontes inacessíveis, arquivos que não são PDF, PDFs protegidos e falhas de
  extração também recebem resultados explícitos, em vez de parecerem simplesmente
  ausentes. As observações permanecem internas e não substituem automaticamente
  os metadados editoriais do catálogo. Tecnicamente, o fluxo separa aquisição,
  inspeção e persistência `append-only`: cada observação recebe identidade própria
  em `source_observations`, registra estados de sucesso e falha e preserva o
  histórico sem sobrescrever observações anteriores.
  [PR #167](https://github.com/lumamontes/biblioteca-de-zines/pull/167) [PR #158](https://github.com/lumamontes/biblioteca-de-zines/pull/158) [commit 2a5894c](https://github.com/lumamontes/biblioteca-de-zines/commit/2a5894c) [commit d8684aa](https://github.com/lumamontes/biblioteca-de-zines/commit/d8684aa)

- **Histórico editorial e changelog técnico**: a Biblioteca passa a ter uma
  linha do tempo pública para eventos e marcos do projeto, além de uma visão
  para pessoas interessadas na implementação. A visão técnica é renderizada
  diretamente deste arquivo, mantém as mudanças agrupadas pela unidade de
  trabalho que elas explicam e separa o que ainda não foi publicado. O parser
  converte as seções Markdown em dados tipados (`ChangelogSection` e
  `ChangelogEntry`), preservando categorias, datas e links para que a mesma fonte
  alimente a página pública sem duplicar conteúdo.
  [commit 594a1f3](https://github.com/lumamontes/biblioteca-de-zines/commit/594a1f36dcd993c6ba206a1e8cae68d5c77927de)

- **Monorepo para o catálogo e o visualizador**: o projeto foi reorganizado como
  um monorepo gerenciado por pnpm, mantendo o catálogo em `apps/web` e o
  visualizador isolado em `apps/viewer`.
  As aplicações preservam configurações e deploys independentes, mas compartilham
  histórico, contratos e dependências de workspace quando necessário. A mudança
  de arquitetura foi implementada sem alterar o funcionamento do catálogo
  existente.
  [PR #158](https://github.com/lumamontes/biblioteca-de-zines/pull/158) [ADR do monorepo](docs/decisions/16-monorepo.md)

- **Visualizador independente de páginas de zines**:
  depois das pesquisas sobre imagens das páginas do PDF, processamento assíncrono e
  integração do BookReader, a decisão sobre o release do visualizador registra
  como o visualizador de páginas de zines funciona, preservando a aplicação de
  catálogo e deixando o runtime do BookReader isolado. A integração entrou na `main` com endereços canônicos de leitura e controles de liberação por publicação. A configuração de build permite implantar o viewer separadamente. O lançamento pelo deploy automático da `main` ocorreu em 18/10/2026. A implantação em produção foi posteriormente confirmada com as rotas de leitura e incorporação de uma publicação e seu manifesto ativo de 48 páginas. [Verificação em produção na #153](https://github.com/lumamontes/biblioteca-de-zines/issues/153)
  [PR #158](https://github.com/lumamontes/biblioteca-de-zines/pull/158) [PR #168](https://github.com/lumamontes/biblioteca-de-zines/pull/168) [PR #169](https://github.com/lumamontes/biblioteca-de-zines/pull/169) [PR #170](https://github.com/lumamontes/biblioteca-de-zines/pull/170) [PR #175](https://github.com/lumamontes/biblioteca-de-zines/pull/175) [ADR do release do visualizador](docs/decisions/14-viewer-release-and-page-derivatives.md) [ADR 13](docs/decisions/13-internet-archive-bookreader-page-derivatives.md)

- **Pesquisa e decisão sobre o visualizador de páginas de zines**: a avaliação
  técnica e com uma pessoa usuária selecionou o Internet Archive BookReader para
  o beta e para o caminho planejado de produção, em vez da combinação
  PDF.js/StPageFlip, `react-pageflip` ou uma implementação própria com Three.js.
  O spike anterior permanece preservado como evidência histórica, mas não é mais
  a recomendação ativa. A especificação do visualizador isolado documenta o
  limite entre o catálogo, o endpoint de dados, o `iframe`, o embed e o runtime
  do BookReader; os runbooks documentam rollout selecionado, métricas, critérios
  de confiabilidade, rollback e revisão legal. O plano de avaliação prevê publicações e pessoas testadoras selecionadas antes de uma ampliação.
  [ADR 15](docs/decisions/15-reader-engine-selection.md) [Spike histórico](docs/spikes/visual-publication-reader-findings.md) [Especificação do visualizador e embed](docs/specs/isolated-bookreader-viewer-and-embed.md) [Operação do beta](docs/operations/bookreader-viewer-beta.md) [Avaliação do beta](docs/operations/bookreader-viewer-beta-evaluation.md) [PR #135](https://github.com/lumamontes/biblioteca-de-zines/pull/135) [PR #157](https://github.com/lumamontes/biblioteca-de-zines/pull/157)

- **Descoberta de pessoas autoras e links de apoio**: páginas de pessoas autoras
  passam a reconhecer mais plataformas, distinguir links de financiamento,
  mostrar previews quando há metadados disponíveis e organizar a lista por
  inicial. Isso torna mais fácil encontrar o trabalho de uma pessoa e seguir para a
  plataforma correta, sem tratar todos os links externos como se fossem iguais.
  [commit 6956df8](https://github.com/lumamontes/biblioteca-de-zines/commit/6956df8) [commit 526e729](https://github.com/lumamontes/biblioteca-de-zines/commit/526e729) [commit 4247fc1](https://github.com/lumamontes/biblioteca-de-zines/commit/4247fc1) [commit c196083](https://github.com/lumamontes/biblioteca-de-zines/commit/c196083) [commit 7ebbec2](https://github.com/lumamontes/biblioteca-de-zines/commit/7ebbec2) [commit c3dcc17](https://github.com/lumamontes/biblioteca-de-zines/commit/c3dcc17)

### Corrigido

- **Leitura de páginas panorâmicas**: O leitor apresenta uma imagem por vez quando o manifesto identifica páginas panorâmicas. Isso preserva a composição das digitalizações que já contêm uma página dupla.
  [PR #182](https://github.com/lumamontes/biblioteca-de-zines/pull/182)

- **Guia de submissão durante o preenchimento**: O formulário mantém o guia de envio visível durante o preenchimento para que a pessoa possa consultar as orientações enquanto informa os dados da publicação.
  [PR #181](https://github.com/lumamontes/biblioteca-de-zines/pull/181)

- **Navegação entre os modos de leitura**: O modo selecionado persiste ao recarregar a página, a barra do leitor oferece acesso ao arquivo original e as abas de publicação mantêm o alinhamento em telas pequenas.
  [PR #178](https://github.com/lumamontes/biblioteca-de-zines/pull/178) [PR #176](https://github.com/lumamontes/biblioteca-de-zines/pull/176) [PR #171](https://github.com/lumamontes/biblioteca-de-zines/pull/171)

- **Apresentação das novidades do projeto**: A página de novidades passou a apresentar vídeos locais, incluindo o vídeo sobre o leitor, e permite ampliar imagens e fechar a visualização pelo teclado ou pelo fundo.
  [PR #174](https://github.com/lumamontes/biblioteca-de-zines/pull/174)

- **Navegação e recursos editoriais**: a paginação da listagem de zines agora
  respeita o recuo lateral da grade em telas grandes, e o breadcrumb das páginas
  de detalhes começa alinhado ao logo do cabeçalho. A listagem de autores deixa
  de exibir registros sem nenhuma zine publicada, enquanto autores com uma única
  zine publicada continuam visíveis. Os botões sociais e os previews de links de
  autorias também ficam em seções separadas para evitar diferenças confusas de
  altura. A página Sobre passou a apontar para os recursos do Viveiro Digital
  sobre acervos independentes. [PR #177](https://github.com/lumamontes/biblioteca-de-zines/pull/177) [commit 9b5bd86](https://github.com/lumamontes/biblioteca-de-zines/commit/9b5bd86) [commit de2ed9e](https://github.com/lumamontes/biblioteca-de-zines/commit/de2ed9e) [commit de321eb](https://github.com/lumamontes/biblioteca-de-zines/commit/de321eb) [commit f5ce831](https://github.com/lumamontes/biblioteca-de-zines/commit/f5ce831)

## 2026-10-15

### Adicionado

- **Menções recentes na mídia**: a página inicial e o Clube de Zines passaram a
  destacar matérias recentes, com títulos e descrições editoriais estáveis mesmo
  quando os metadados remotos não estão disponíveis. A atualização também
  renovou o conteúdo e as datas das edições do clube. A implementação usa
  títulos editoriais determinísticos como fallback, evitando cards vazios ou
  instáveis quando a leitura de metadados externos falha. [PR #159](https://github.com/lumamontes/biblioteca-de-zines/pull/159)

## 2026-10-12

### Adicionado

- **Geração de imagens das páginas do PDF**: publicações aprovadas podem gerar
  uma imagem para cada página do PDF e uma capa derivada para exibição. O fluxo executa de forma assíncrona, pode ser repetido com
  segurança, registra o estado do processamento, tenta novamente operações
  recuperáveis e só expõe uma geração completa. Esta é a infraestrutura de
  processamento publicada; não é uma afirmação de que o novo visualizador de
  páginas de zines já está disponível. A pesquisa que acompanhou essa
  implementação mediu o inventário de PDFs, o custo de rasterização, isto é, de
  transformar páginas PDF em imagens, e o tamanho dos derivados antes de
  consolidar a decisão do BookReader. As decisões históricas sobre separação de
  assets, processamento na publicação e integração do BookReader estão
  registradas nos ADRs 10, 11 e 13. [PR #134](https://github.com/lumamontes/biblioteca-de-zines/pull/134) [PR #143](https://github.com/lumamontes/biblioteca-de-zines/pull/143) [ADR 10](docs/decisions/10-private-public-page-asset-lifecycle.md) [ADR 11](docs/decisions/11-process-pages-at-publication.md) [ADR 13](docs/decisions/13-internet-archive-bookreader-page-derivatives.md)
  Por baixo, uma geração é um conjunto versionado de páginas, capa, dimensões e
  `manifest` produzido a partir de um PDF de origem. Ela é imutável e só vira
  ativa depois que os arquivos passam pelas verificações necessárias; uma falha
  mantém a geração anterior ou devolve o PDF como fallback, em vez de publicar
  um estado parcial. Os assets são versionados por `generation_id` e os jobs de
  processamento podem ser repetidos sem sobrescrever a geração ativa.

- **Telemetria de visualização de páginas**: a aplicação passou a registrar
  visualizações agregadas de páginas, sem adicionar uma camada própria de
  rastreamento de usuários. O componente é carregado no `layout.tsx`
  compartilhado, mantendo a instrumentação fora das páginas e sem criar eventos
  de domínio ou armazenamento local de perfis. [PR #141](https://github.com/lumamontes/biblioteca-de-zines/pull/141) [PR #144](https://github.com/lumamontes/biblioteca-de-zines/pull/144)

### Descontinuado

- **Processamento somente da capa como fluxo principal**: gerar apenas uma capa
  WebP a partir da primeira página deixa de ser a estratégia principal para
  novas publicações. O comportamento continua disponível para compatibilidade e
  migração de capas antigas, enquanto a infraestrutura nova usa gerações
  completas de páginas. [ADR 12](docs/decisions/12-cover-only-processing-at-publication.md)

## 2026-10-11

### Alterado

- **Pesquisa e arquitetura provisória do catálogo**: o modelo de informação
  passou a tratar semântica local, autoria contextual, privacidade, acesso e
  proveniência como decisões do próprio projeto. Padrões externos são usados
  como lentes e mapeamentos seletivos de campos (`crosswalks`), e políticas
  finais de catálogo e acesso continuam condicionadas a consulta pública com
  zineiros antes de uma migração. [PR #132](https://github.com/lumamontes/biblioteca-de-zines/pull/132) [ADR 8](docs/decisions/8-community-consultation-for-catalogue-policies.md) [ADR 9](docs/decisions/9-open-standards-as-crosswalks.md)

### Corrigido

- **Resiliência da revisão e das capas**: o dashboard passou a conter valores
  longos, validar fontes de imagem externas e lidar melhor com falhas de
  autenticação e manifestos locais. Isso evita que dados de revisão ou capas
  incomuns quebrem a interface administrativa e os fallbacks de exibição do PDF
  e das capas. A
  proteção acontece nas fronteiras de autenticação, validação de origem e
  renderização segura, sem transformar URLs externas arbitrárias em dependências
  confiáveis do catálogo. O fallback passa por `SafeImage` e pelas regras de
  `next.config.ts`, em vez de confiar diretamente em qualquer URL recebida.
  [PR #133](https://github.com/lumamontes/biblioteca-de-zines/pull/133)

## 2026-09-24

### Adicionado

- **Pesquisa e perfil provisório de catálogo e acesso**: o projeto documentou
  entidades, papéis, campos privados, proveniência e questões de acesso, mantendo
  decisões sobre edições e políticas finais explicitamente abertas. [PR #130](https://github.com/lumamontes/biblioteca-de-zines/pull/130) [Perfil de catálogo e acesso](docs/catalogue-access-profile.md)
  O modelo distingue obra, edição, publicação, autoria, submissão, `asset`,
  derivado, processamento e acesso; campos privados e incertezas de proveniência
  não são achatados em uma única ficha editorial. Os campos de `form_uploads`
  continuam distintos dos registros públicos de `library_zines`, e
  `access_profile` não é inferido automaticamente a partir da existência de um
  arquivo.

- **Pesquisa de linha de base do acervo**: o inventário passou a produzir uma
  evidência reproduzível do estado dos registros do catálogo, das fontes e dos
  arquivos locais, facilitando a investigação de links quebrados e divergências
  futuras. [PR #128](https://github.com/lumamontes/biblioteca-de-zines/pull/128) [PR #129](https://github.com/lumamontes/biblioteca-de-zines/pull/129) [Baseline do acervo](docs/archive-baseline.md)
  A linha de base (`baseline`) registra o estado observado de registros do
  catálogo, URLs de fonte, arquivos locais e evidências de processamento em um
  ponto conhecido. O inventário usa identificadores estáveis e relatórios
  versionáveis para que uma execução posterior possa ser comparada com a
  evidência anterior, em vez de depender de uma conferência manual não
  reproduzível.

## 2026-09-23

### Adicionado

- **Orientações para contribuição técnica**: O repositório ganhou orientações para localizar as tarefas e os documentos de domínio, além de registrar quais rótulos a equipe utiliza durante a triagem das issues.
  [PR #118](https://github.com/lumamontes/biblioteca-de-zines/pull/118)

- **Inventário reproduzível do acervo**: a equipe pode comparar registros do
  catálogo, arquivos locais e evidências das fontes usando o mesmo procedimento
  em execuções diferentes. Isso transforma uma checagem manual e difícil de
  repetir em uma base para investigar arquivos ausentes, divergências e
  mudanças no acervo. [PR #127](https://github.com/lumamontes/biblioteca-de-zines/pull/127)

## 2026-09-21

### Adicionado

- **Cópias operacionais de PDFs publicados**: a equipe passou a poder baixar
  cópias locais dos PDFs publicados para recuperação quando uma fonte externa
  falhar. Essas cópias ficam fora do Git e servem para recuperação operacional;
  não são automaticamente assets públicos nem substituem o PDF original como
  fonte da publicação.
  A publicação também deixou de misturar os links de várias pessoas autoras,
  preservando os links correspondentes a cada autoria e sinalizando registros
  legados ambíguos para revisão manual. [PR #117](https://github.com/lumamontes/biblioteca-de-zines/pull/117)
  O arquivo local fica fora do Git e funciona como cópia operacional de
  recuperação; a associação de links usa codificação posicional compatível com
  os campos legados `author_name` e `author_url`, preservando dados antigos sem
  fingir que a autoria pode ser reconstruída quando a fonte não informa a relação
  original.

## 2026-09-13

### Adicionado

- **Monitoramento de PDFs publicados**: um workflow verifica os registros
  públicos do catálogo e as URLs de PDF associadas a eles a partir do Supabase,
  produzindo evidências sobre o que precisa ser processado ou investigado. A
  operação deixa de depender apenas de alguém
  lembrar quais publicações foram alteradas; correções posteriores isolam o
  monitor, evitam colisões de diretório e restringem a verificação a publicações.
  [PR #101](https://github.com/lumamontes/biblioteca-de-zines/pull/101) [PR #102](https://github.com/lumamontes/biblioteca-de-zines/pull/102) [PR #103](https://github.com/lumamontes/biblioteca-de-zines/pull/103) [PR #105](https://github.com/lumamontes/biblioteca-de-zines/pull/105)
  O workflow exporta recursos publicados, executa o monitor externo sem expor
  credenciais de serviço e armazena JSON e Markdown como artefatos para
  investigação posterior; os PRs seguintes corrigiram o isolamento do checkout
  e a fonte única da versão do pnpm.

## 2026-09-11

### Alterado

- **Recuperação do build de produção**: A atualização das dependências e dos módulos de importação de arquivos ajustou o build do catálogo, incluindo o processamento de PDFs e a integração com o armazenamento.
  [PR #99](https://github.com/lumamontes/biblioteca-de-zines/pull/99)

## 2026-03-14

### Adicionado

- **SEO e descoberta**: páginas públicas passaram a expor metadados regionais,
  URLs canônicas, sitemap, robots, JSON-LD, breadcrumbs e dados estruturados de
  zines e autorias. A configuração de imagens também ficou mais restrita e
  previsível. A camada de SEO combina metadados estáticos, sitemap dinâmico,
  robots e JSON-LD por entidade, enquanto os domínios remotos de imagem são
  explicitamente permitidos em vez de aceitar qualquer hostname. [PR #98](https://github.com/lumamontes/biblioteca-de-zines/pull/98)

## 2026-03-01

### Alterado

- **Conteúdo do Clube de Zines**: o clube passou a mostrar a linha do tempo de
  temas de 2025-2026, links do Instagram e o tema ativo mais recente, dando às
  pessoas visitantes uma forma mais clara de acompanhar a programação e acessar
  cada publicação relacionada ao clube. O conteúdo permanece em código e é
  ordenado pela página como dados editoriais, sem depender de uma API externa
  para renderizar a programação corrente. [PR #97](https://github.com/lumamontes/biblioteca-de-zines/pull/97)

## 2025-12-21

### Adicionado

- **Páginas de pessoas autoras e coletivos**: pessoas autoras e coletivos
  publicados ganharam URLs próprias, e a listagem passou a ser paginada para
  continuar utilizável quando o catálogo cresce. As páginas usam `slug` como
  identificador legível, consultas filtradas e paginação explícita para evitar
  carregar todo o acervo no primeiro render; metadados e links são derivados do
  mesmo registro público. [PR #94](https://github.com/lumamontes/biblioteca-de-zines/pull/94) [ADR 5](docs/decisions/5-pagination.md) [ADR 6](docs/decisions/6-author-pages.md)

- **Blog público**: a aplicação passou a buscar e exibir artigos do Substack em
  uma página própria, com cards, imagens e integração na navegação principal.
  [PR #96](https://github.com/lumamontes/biblioteca-de-zines/pull/96) A página
  consome o feed remoto no servidor, normaliza HTML e datas e aplica truncamento
  antes de renderizar cards, mantendo o layout previsível quando um artigo chega
  com descrição extensa ou metadados incompletos.

### Segurança

- **Atualização de React Server Components**: vulnerabilidades conhecidas no
  conjunto de dependências de React Server Components foram corrigidas, evitando
  manter a aplicação em versões afetadas. [PR #95](https://github.com/lumamontes/biblioteca-de-zines/pull/95)

## 2025-11-21

### Adicionado

- **Remoção do workflow de avisos no Telegram**: O workflow de notificação de deploy introduzido naquele dia foi removido do repositório. A presença das variáveis de configuração no exemplo de ambiente deixou de indicar que a automação estava ativa.
  [PR #93](https://github.com/lumamontes/biblioteca-de-zines/pull/93)

- **Notificações de deploy**: o projeto passou a enviar avisos de deploy pelo
  Telegram, dando à equipe um sinal operacional quando uma nova versão é
  publicada. [PR #91](https://github.com/lumamontes/biblioteca-de-zines/pull/91) [PR #92](https://github.com/lumamontes/biblioteca-de-zines/pull/92)

## 2025-10-04

### Alterado

- **Landing page e Clube de Zines**: a apresentação inicial, a navegação e a
  página do clube foram atualizadas para explicar melhor a iniciativa e seus
  caminhos de participação. [PR #87](https://github.com/lumamontes/biblioteca-de-zines/pull/87) [PR #88](https://github.com/lumamontes/biblioteca-de-zines/pull/88)

- **Edição de previews no dashboard**: a equipe passou a editar campos do
  preview de submissões diretamente no dashboard, com feedback de erro mais
  claro, reduzindo a necessidade de repetir uma submissão quando um dado precisa
  ser corrigido antes da publicação. [PR #85](https://github.com/lumamontes/biblioteca-de-zines/pull/85)

## 2025-10-03

### Alterado

- **Apresentação da Biblioteca na página inicial**: A página inicial recebeu novos recursos visuais e a apresentação do projeto foi atualizada, preparando os ajustes de navegação e do Clube de Zines que entrariam na sequência.
  [PR #86](https://github.com/lumamontes/biblioteca-de-zines/pull/86)

## 2025-07-10

### Adicionado

- **Preview editável de submissões**: o fluxo de revisão ganhou um componente
  para editar o upload antes da publicação, permitindo corrigir informações
  recebidas sem reiniciar todo o processo de revisão. [PR #84](https://github.com/lumamontes/biblioteca-de-zines/pull/84)

## 2025-07-09

### Adicionado

- **Filtros por categoria**: o catálogo passou a combinar filtros de categorias
  para que uma pessoa consiga restringir a busca sem depender apenas da
  navegação por páginas. [PR #76](https://github.com/lumamontes/biblioteca-de-zines/pull/76) [PR #77](https://github.com/lumamontes/biblioteca-de-zines/pull/77) [PR #78](https://github.com/lumamontes/biblioteca-de-zines/pull/78) [PR #82](https://github.com/lumamontes/biblioteca-de-zines/pull/82) [PR #83](https://github.com/lumamontes/biblioteca-de-zines/pull/83)

## 2025-07-03

### Alterado

- **Mensagens dos filtros do catálogo**: O seletor passou a informar quando uma busca termina sem resultados, usando uma mensagem que também se aplica quando a pessoa procura opções além de categorias.
  [PR #80](https://github.com/lumamontes/biblioteca-de-zines/pull/80)

## 2025-07-02

### Alterado

- **Seleção e exibição de categorias**: O formulário passou a contar com seleção múltipla e a interface ganhou um componente para exibir categorias, preparando os filtros de descoberta que entraram posteriormente no catálogo.
  [PR #75](https://github.com/lumamontes/biblioteca-de-zines/pull/75)

## 2025-07-01

### Adicionado

- **Categorias para organizar o catálogo**: zines podem receber categorias e
  badges, e a interface administrativa permite selecionar mais de uma categoria
  ao mesmo tempo. Isso cria uma estrutura de descoberta que não depende de uma
  única classificação textual. A implementação mantém categorias em uma tabela
  própria (`categories`), conecta seleção administrativa, validação da submissão
  (`apply-zine`) e filtros públicos, e permite combinar critérios sem codificar a
  taxonomia na interface.
  [PR #74](https://github.com/lumamontes/biblioteca-de-zines/pull/74)

## 2025-06-21

### Corrigido

- **Acessibilidade do formulário**: campos da submissão passaram a ter IDs
  únicos, melhorando a associação entre rótulos, controles e mensagens de erro.
  Com isso, tecnologias assistivas conseguem anunciar cada campo de forma mais
  previsível durante o preenchimento e a revisão. [PR #71](https://github.com/lumamontes/biblioteca-de-zines/pull/71)

## 2025-06-20

### Adicionado

- **Formulário de submissão de zines**: pessoas podem enviar um zine pelo site
  com os dados necessários para revisão. O formulário valida a entrada, guarda a
  submissão e notifica a equipe, substituindo o encaminhamento manual dessas
  informações. O fluxo separa o formulário público do dashboard de revisão,
  persiste o upload em `form_uploads` como uma submissão pendente e notifica a
  equipe sem tornar a publicação automática. [PR #65](https://github.com/lumamontes/biblioteca-de-zines/pull/65) [ADR 4](docs/decisions/4-custom-zine-submission-form.md)

## 2025-06-15

### Corrigido

- **URLs de miniaturas**: a resolução de capas passou a aceitar formatos
  adicionais de URL e a lidar melhor com fontes incompatíveis, reduzindo capas
  quebradas quando uma publicação usa uma origem diferente da esperada. [PR #64](https://github.com/lumamontes/biblioteca-de-zines/pull/64)

## 2025-03-05

### Alterado

- **Renderização das imagens nos cartões**: Os cartões de zines passaram a exibir a capa com um elemento de imagem do navegador. A mudança ficou restrita à apresentação dos itens na listagem do catálogo.
  [PR #63](https://github.com/lumamontes/biblioteca-de-zines/pull/63)

- **Ordenação inicial do catálogo**: a listagem passou a abrir mostrando as
  publicações mais recentes, deixando a visualização histórica como opção e
  tornando o conteúdo novo mais fácil de encontrar na primeira visita. [PR #62](https://github.com/lumamontes/biblioteca-de-zines/pull/62)

## 2025-02-02

### Adicionado

- **Administração e busca do catálogo**: a equipe passou a acessar um dashboard
  autenticado para revisar e publicar zines, enquanto o catálogo público ganhou
  busca por texto e pessoa autora. O fluxo de revisão trabalha com submissões em
  `form_uploads` antes de atualizar registros públicos em `library_zines`. [PR #49](https://github.com/lumamontes/biblioteca-de-zines/pull/49) [PR #51](https://github.com/lumamontes/biblioteca-de-zines/pull/51)

- **Carregamento progressivo do catálogo**: cards de zines passaram a exibir
  placeholders visuais de carregamento (`skeletons`) para reduzir a sensação de
  espera e manter a estrutura da página estável enquanto os resultados chegam.
  [PR #58](https://github.com/lumamontes/biblioteca-de-zines/pull/58)

- **Página sobre a iniciativa**: o site ganhou uma página pública explicando a
  Biblioteca e uma navegação adaptada para telas menores, facilitando o acesso
  às informações institucionais em dispositivos móveis. [PR #47](https://github.com/lumamontes/biblioteca-de-zines/pull/47)

## 2025-01-29

### Alterado

- **Destino do link da newsletter**: A configuração de navegação passou a apontar para o endereço corrigido da newsletter, permitindo que visitantes cheguem à publicação a partir do link oferecido pelo site.
  [PR #45](https://github.com/lumamontes/biblioteca-de-zines/pull/45)

- **URLs estáveis para zines**: a página de preview passou a usar slugs como
  identificadores legíveis na rota pública, tornando os links mais fáceis de
  reconhecer, compartilhar e recuperar sem depender de um UUID. [PR #44](https://github.com/lumamontes/biblioteca-de-zines/pull/44)

## 2025-01-26

### Adicionado

- **Modelo persistente para zines**: o catálogo ganhou tabelas próprias para
  separar zines, autorias, publicações e o estado de cada registro. Essa base
  permitiu deixar de tratar o acervo como uma coleção de links soltos e criar
  operações de administração sobre os dados. As tabelas `zines`, `authors`,
  `library_zines` e `form_uploads` sustentam essa separação no armazenamento,
  permitindo que o estado editorial mude sem confundir a identidade da obra com
  o registro de uma submissão ou com a URL de uma fonte externa. [PR #42](https://github.com/lumamontes/biblioteca-de-zines/pull/42)

## 2025-01-21

### Alterado

- **Revisão dos recursos visuais públicos**: Os arquivos usados na interface e no manifesto do site foram reorganizados, incluindo ícones e imagens da página inicial que o navegador carrega pela pasta pública.
  [PR #39](https://github.com/lumamontes/biblioteca-de-zines/pull/39)

## 2025-01-20

### Adicionado

- **Testes de fluxo no navegador**: os primeiros testes de ponta a ponta (`E2E`)
  cobriram a página inicial, a listagem e o `preview` de zines, tornando
  verificável o fluxo público básico. O Playwright executa esses cenários contra
  o runtime real e mantém a configuração de navegador separada dos testes
  unitários, cobrindo regressões de navegação, carregamento e rotas públicas. [PR #29](https://github.com/lumamontes/biblioteca-de-zines/pull/29) [PR #30](https://github.com/lumamontes/biblioteca-de-zines/pull/30) [ADR 3](docs/decisions/3-playwright.md)

## 2025-01-18

### Adicionado

- **Dependências e capas na página do zine**: A equipe corrigiu a dependência do Supabase e a tipagem usada no build da página de detalhes. O ajuste seguinte corrigiu o endereço utilizado para exibir a imagem da capa.
  [PR #31](https://github.com/lumamontes/biblioteca-de-zines/pull/31) [PR #35](https://github.com/lumamontes/biblioteca-de-zines/pull/35) [PR #36](https://github.com/lumamontes/biblioteca-de-zines/pull/36)

- **Metadados sociais por zine**: cada página de zine passou a gerar título,
  descrição e imagem de Open Graph específicos para compartilhamento, fazendo
  com que cada link apresente informações da publicação correta nas redes
  sociais. Esses metadados controlam o cartão exibido quando a URL da zine é
  compartilhada. [PR #34](https://github.com/lumamontes/biblioteca-de-zines/pull/34)

## 2025-01-17

### Alterado

- **Identificação de quem mantém o projeto**: O README passou a identificar as pessoas mantenedoras da Biblioteca, oferecendo um ponto de referência a quem chega pelo repositório e deseja conhecer a equipe do projeto.
  [PR #28](https://github.com/lumamontes/biblioteca-de-zines/pull/28)

- **Gerenciamento de dependências com pnpm**: o projeto passou a documentar pnpm
  como gerenciador oficial, com lockfile e comandos reproduzíveis para instalar,
  desenvolver e verificar a aplicação. A troca removeu o lockfile concorrente do
  npm e fez o campo `packageManager` e `pnpm-lock.yaml` funcionarem como a
  referência única para desenvolvimento local e CI. O campo fixa a versão
  esperada e o lockfile registra a resolução das dependências. [PR #27](https://github.com/lumamontes/biblioteca-de-zines/pull/27) [ADR 2](docs/decisions/2-pnpm.md)

## 2025-01-16

### Adicionado

- **Documentação de arquitetura e idioma do projeto**: a documentação passou a
  ter uma estrutura de Architecture Decision Records (`ADR`), e o português foi
  registrado como idioma das decisões antes de consolidar as demais escolhas
  técnicas. [PR #23](https://github.com/lumamontes/biblioteca-de-zines/pull/23) [PR #24](https://github.com/lumamontes/biblioteca-de-zines/pull/24) [ADR 1](docs/decisions/1-adr.md)

## 2025-01-15

### Alterado

- **Acesso ao Telegram pela navegação social**: A navegação social recebeu o ícone do Telegram para identificar o canal correspondente e permitir que visitantes reconheçam o destino antes de seguir o link.
  [PR #22](https://github.com/lumamontes/biblioteca-de-zines/pull/22)

## 2025-01-14

### Adicionado

- **Integração inicial com Supabase**: a aplicação passou a usar o Supabase como
  fronteira de persistência e autenticação para consultar os dados do catálogo,
  substituindo o conjunto inicial de dados em `Notion`. O acesso atravessa
  clientes separados para servidor, navegador e middleware, e os registros
  públicos são consultados por `zine-service` através do cliente do Supabase,
  com variáveis de ambiente separadas para URL e chave anônima. [PR #14](https://github.com/lumamontes/biblioteca-de-zines/pull/14)

## 2025-01-13

### Alterado

- **Orientações iniciais para colaboradores**: O repositório passou a reunir a apresentação do projeto, as instruções de contribuição, a licença e o código de conduta para quem deseja participar do desenvolvimento.
  [PR #11](https://github.com/lumamontes/biblioteca-de-zines/pull/11)

## 2025-01-12

### Adicionado

- **Limpeza dos arquivos do projeto inicial**: Os recursos de exemplo fornecidos com a estrutura inicial foram retirados da pasta pública, separando os arquivos usados pela Biblioteca das imagens do modelo de aplicação.
  [PR #10](https://github.com/lumamontes/biblioteca-de-zines/pull/10)

- **Estrutura inicial do projeto**: criação da aplicação Biblioteca de Zines, da
  primeira interface do catálogo e da base de documentação sobre a qual o
  projeto colaborativo seria desenvolvido. Esse ciclo estabeleceu o repositório,
  a aplicação web e a prática de registrar decisões arquiteturais, em vez de
  manter o projeto apenas como uma ideia distribuída.
  [commit b08b129](https://github.com/lumamontes/biblioteca-de-zines/commit/b08b129) [ADR 1](docs/decisions/1-adr.md)

