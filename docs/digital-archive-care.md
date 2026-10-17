# Digital Archive Care

Situação: síntese de trabalho para a próxima versão do monorepo. Este documento
não descreve a produção atual e não substitui a consulta comunitária ou uma
política final de direitos, acesso e preservação.

## Para que este documento existe

As decisões da Biblioteca foram registradas em momentos diferentes. Algumas
descrevem o sistema que está em produção hoje, outras descrevem a próxima
versão do monorepo e outras ainda registram perguntas de pesquisa.

Este documento organiza essas camadas sem apagar o histórico das ADRs. A ideia é
deixar claro o que já funciona, o que está sendo construído e o que ainda precisa
ser discutido com zineiros e com a comunidade.

## Três estados do projeto

### Produção atual

A versão atualmente publicada ainda representa o modelo legado:

- submissões dependem de uma URL externa para o PDF;
- a leitura pública depende do provider externo quando disponível;
- a Biblioteca mantém metadados e referências de acesso, mas não deve chamar
  uma URL externa de original preservado;
- o monitoramento observa a disponibilidade de recursos externos;
- o modelo de direitos, retenção e preservação ainda não está finalizado.

Este estado é o baseline histórico do arquivo. Ele não deve ser usado para
descrever o comportamento esperado da próxima versão.

### Próxima versão do monorepo

O monorepo contém a versão que será publicada depois do release e da validação
do viewer:

- viewer próprio baseado no Internet Archive BookReader;
- processamento assíncrono de PDFs de publicações aprovadas;
- geração completa de imagens de páginas e capa;
- gerações imutáveis e manifest ordenado;
- assets entregues pelo R2 com cache;
- fallback para o PDF original;
- processamento que não começa enquanto a submissão não for aprovada;
- monitoramento e jobs de processamento com retry e recuperação.

Essa versão ainda é uma versão futura até ser implantada em produção. As ADRs
que descrevem esse caminho devem ser lidas como decisões do monorepo alvo, não
como descrição do site publicado atualmente.

### Pesquisa e versões posteriores

Depois do viewer, o trabalho pode avançar para uma nova versão de submissão e
catalogação. Ela poderá incluir:

- upload direto de um ou mais PDFs;
- armazenamento temporário privado durante o preenchimento;
- extração de metadados técnicos;
- valores sugeridos e editáveis para revisão da pessoa autora;
- retenção de originais autorizados;
- campos de proveniência, direitos, acesso e versões de arquivo;
- fluxo claro de correção, restrição e remoção.

Essa etapa depende da consulta comunitária e não deve ser confundida com uma
consequência automática do release do viewer.

O objetivo dessa etapa é deixar de depender de links externos como fonte
principal. O PDF enviado diretamente passa a ser a fonte de processamento e,
quando a política de retenção for definida, o original autorizado também poderá
ser mantido pela Biblioteca. O processamento necessário para oferecer leitura e
entrega continua sendo explicado de forma transparente, mas não precisa virar
uma escolha técnica separada no formulário.

## Princípios de cuidado

### O arquivo não é apenas o arquivo

Uma publicação envolve catálogo, arquivo de origem, cópia de leitura, preview,
capa, páginas derivadas, dados de autoria, contexto e decisões de acesso. Esses
elementos podem ter finalidades e níveis de visibilidade diferentes.

### Publicar não significa permitir tudo

Descoberta, leitura, download, preservação, replicação e reutilização são
decisões diferentes. Uma publicação pública não deve ser tratada
automaticamente como autorização para qualquer uso da obra.

### Metadados precisam de contexto

Um valor pode ter sido fornecido por uma pessoa autora, extraído do PDF,
observado pelo sistema ou revisado por uma pessoa mantenedora. A origem do valor
é parte da informação e não deve ser perdida durante a catalogação.

### Derivados não são originais

Imagens de páginas e capas existem para entrega e leitura. Elas não substituem o
PDF de origem, não provam autorização e não devem ser tratadas como cópias de
preservação sem uma decisão específica.

### A comunidade participa das políticas

Representação, privacidade, autoria, acesso, preservação, reutilização,
correção e retirada afetam diretamente zineiros. A Biblioteca deve pesquisar,
consultar, publicar uma síntese e explicar quais decisões foram tomadas antes de
fechar políticas novas.

## Como as ferramentas se relacionam

Perguntas sobre o projeto podem mencionar “Internet Archive”, “BookReader” ou
“Cloudflare” como se fossem a mesma parte do sistema. Elas têm funções
diferentes:

- **Internet Archive BookReader:** software usado pelo viewer para exibir um
  manifest de páginas. Não é o armazenamento automático dos PDFs da Biblioteca.
- **Fontes externas:** a Biblioteca pode receber links do Google Drive, Internet
  Archive, site próprio da pessoa autora ou outros serviços. O link precisa
  fornecer um PDF acessível para download e processamento. Quando ele aponta
  apenas para uma página de leitura externa, pode continuar sendo usado como
  fallback, mas não necessariamente como fonte PDF processável.
- **Cloudflare R2:** storage de entrega dos derivados gerados pela Biblioteca,
  como páginas e capas. Esses objetos não são automaticamente originais de
  preservação nem prova de autorização.
- **PDF original:** no fluxo atual, continua sendo uma referência externa. Na
  versão posterior de upload direto, poderá ser recebido e retido pela
  Biblioteca quando houver autorização e política para isso.

Essa separação deve ser explicada sempre que alguém perguntar por que usamos um
reader do Internet Archive sem enviar o acervo para lá. Usar o software não
significa terceirizar catálogo, direitos, remoção ou preservação.

## Regra atual para fontes externas

O formulário atual aceita uma URL, mas o provedor não é o critério principal.
Google Drive, Internet Archive, site próprio da pessoa autora e outros serviços
podem funcionar se o servidor conseguir acessar o endereço e obter bytes de um
PDF válido.

Links que retornam apenas HTML, exigem login ou senha, expiram, bloqueiam acesso
automatizado ou dependem de uma autorização que o worker não possui podem falhar.
Um link externo é uma referência de origem e acesso; ele não é automaticamente
um original preservado pela Biblioteca.

## Trabalho já realizado

- Baseline do acervo e inventário de recursos.
- Estrutura provisória de catálogo e acesso.
- Pesquisa sobre metadados, bibliotecas de zines e padrões de interoperabilidade.
- Monitoramento de PDFs e recursos externos.
- Renderer de PDF e processamento de páginas.
- Gerações imutáveis, fila de processamento e ativação segura.
- Viewer isolado e contrato público de manifest.
- Documentação sobre BookReader, derivados e fallback.

## Trabalho em andamento

- Validar o viewer no monorepo antes do deployment.
- Reconciliar o comportamento do viewer com os recursos realmente publicados.
- Avaliar desempenho, acessibilidade, cache e falhas de processamento.
- Preparar a consulta comunitária sem publicá-la antes de revisar privacidade,
  retenção, contato e finalidade.
- Entender melhor necessidades de catalogação e preservação através da discussão
  pública e do milestone de archive care.

## Decisões ainda abertas

- Se e como originais autorizados serão retidos.
- Por quanto tempo arquivos privados, derivados e evidências operacionais serão
  mantidos.
- Como separar leitura, download, preservação, replicação e reutilização.
- Como verificar pedidos de correção, restrição e remoção.
- Quais campos devem ser obrigatórios no novo formulário.
- Como representar autoria coletiva, pseudonímia, anonimato, incerteza e
  contexto comunitário.
- Se a primeira página deve ser a única fonte de capa para novos uploads.
- Qual parte do processamento deve ocorrer durante o upload e qual somente após
  a publicação.

## Fontes de trabalho

- [Discussão sobre preservação digital e catalogação](https://github.com/lumamontes/biblioteca-de-zines/discussions/115)
- [Milestone Biblioteca archive care pilot](https://github.com/lumamontes/biblioteca-de-zines/milestone/3)
- [Baseline do acervo](./archive-baseline.md)
- [Perfil de catálogo e acesso](./catalogue-access-profile.md)
- [Arquitetura de informação do catálogo](./catalogue-information-architecture.md)
- [Rascunho da consulta comunitária](./biblioteca-community-consultation-draft.md)
- [Processamento de páginas e ciclo de vida de assets](./specs/page-processing-and-asset-lifecycle.md)
- [Versão posterior de upload direto](./specs/direct-upload-and-metadata-intake.md)
