# Biblioteca de Zines — Documentação

Bem-vinde à documentação da Biblioteca de Zines.

Aqui estão reunidas todas as nossas decisões em formato de Architecture Decision Records (ADRs).

## Como ler esta documentação

O [Digital Archive Care](./digital-archive-care.md) é a síntese principal do
estado do projeto. Ele separa a produção atual, a próxima versão do monorepo e
as pesquisas ou versões posteriores.

As ADRs continuam sendo o registro histórico das decisões. Uma ADR pode
descrever a produção atual, uma versão futura ou uma decisão já substituída; o
status aparece logo abaixo do título quando necessário.

### Produção atual

O [baseline do arquivo](./archive-baseline.md) registra como a produção e o
acervo eram observados antes do release do viewer. Ele é evidência histórica,
não uma garantia de preservação.

### Próxima versão do monorepo

A [decisão sobre o release do viewer e as imagens das páginas](./decisions/14-viewer-release-and-page-derivatives.md)
é a referência atual para o monorepo que será publicado no próximo release.

A [seleção do engine do reader visual](./decisions/15-reader-engine-selection.md)
registra o resultado da comparação entre BookReader e a alternativa PDF.js/
StPageFlip, incluindo a avaliação com pessoa usuária que definiu BookReader
como o engine selecionado.

A [especificação de processamento de páginas e ciclo de vida de assets](./specs/page-processing-and-asset-lifecycle.md)
documenta o comportamento operacional desse viewer: gerações completas,
ativação, entrega, reprocessamento e limpeza.

### Pesquisa e versões posteriores

A [especificação de upload direto e intake de metadados](./specs/direct-upload-and-metadata-intake.md)
documenta a versão posterior para upload de PDFs, extração de metadados,
proveniência e revisão humana.

O [perfil provisório de catálogo e acesso](./catalogue-access-profile.md)
separa o modelo atual das decisões futuras de metadados, direitos e plataforma.

O [modelo de organização e metadados do catálogo](./catalogue-information-architecture.md)
transforma esse perfil em uma estrutura concreta para revisão antes da migração.

A [pesquisa para uma base de políticas](../research_notes/Biblioteca%20de%20Zines%20policy%20foundation.md)
separa obrigações legais, boas práticas e decisões que ainda precisam ser consultadas
com zineiros.

O [rascunho de consulta comunitária](./biblioteca-community-consultation-draft.md)
reúne as perguntas sobre representação, privacidade, acesso, direitos, reutilização,
preservação, correção e retirada.

A [decisão sobre consulta comunitária](./decisions/8-community-consultation-for-catalogue-policies.md)
registra por que políticas de catálogo e acesso devem ser consultadas com zineiros
antes da migração.

A [decisão sobre padrões abertos](./decisions/9-open-standards-as-crosswalks.md)
registra por que padrões externos são usados como lentes e crosswalks seletivos,
sem substituir a semântica local da Biblioteca.

A [especificação de geração e migração de capas](./specs/cover-only-generation-and-migration.md)
registra o fluxo histórico de capas e continua sendo referência apenas para
migrações ou compatibilidade legada.

A [decisão sobre processar páginas na publicação](./decisions/11-process-pages-at-publication.md)
registra a decisão histórica e as alternativas consideradas.

A [decisão sobre processamento somente de capas](./decisions/12-cover-only-processing-at-publication.md)
registra uma decisão histórica, supersedida pelo caminho do viewer.

O [runbook de processamento de páginas](./runbooks/page-processing.md)
documenta migrações, scripts, variáveis de ambiente, verificações e recuperação.

Os [documentos operacionais do beta BookReader](./operations/bookreader-viewer-beta.md)
e da [avaliação de release](./operations/bookreader-viewer-beta-evaluation.md)
registram rollout, observabilidade, critérios de expansão, pausa e rollback.

A [pesquisa sobre formatos e catálogos de zines](./zine-format-archive-research.md)
compara fontes brasileiras e internacionais para validar campos físicos, digitais,
geográficos e de classificação.

O [relatório ampliado sobre metadados de zines e biblioteconomia](../reports/Zine%20metadata%20and%20library%20research.md)
registra a pesquisa sobre ZineCore2, práticas de bibliotecas, coleções brasileiras,
privacidade, direitos e contexto comunitário.

O [relatório sobre pesquisa acadêmica e prática profissional em zines](../reports/Zine%20scholarship%20and%20professional%20practice.md)
separa livros, estudos acadêmicos, orientação de bibliotecários e práticas de
coleções especializadas.

O [índice de referências sobre zines e metadados](./zine-research-references.md)
reúne os links externos e os documentos de pesquisa usados nas decisões.

## Como criar uma ADR

São dois passos:

1. Leia por completo nossa [primeira ADR](./decisions/1-adr.md);
2. Leia por completo [nosso formato de documentar decisões: ADRs](./decisions/README.md);

Lendo esses dois documentos você poderá criar uma ADR, [conforme explicado aqui](./decisions/README.md#criando-o-arquivo).
