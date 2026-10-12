# Biblioteca de Zines — Documentação

Bem-vinde à documentação da Biblioteca de Zines.

Aqui estão reunidas todas as nossas decisões em formato de Architecture Decision Records (ADRs).

Nossa documentação também inclui o [baseline do arquivo](./archive-baseline.md),
que registra as conclusões públicas da primeira calibração do inventário.

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

A [especificação de processamento de páginas e ciclo de vida de assets](./specs/page-processing-and-asset-lifecycle.md)
define o bucket público ativo, gerações, reprocessamento de PDFs, capas,
publicação e limpeza futuras.

A [especificação de geração e migração de capas](./specs/cover-only-generation-and-migration.md)
define o fluxo atual de capas geradas a partir da primeira página do PDF.

A [decisão sobre processar páginas na publicação](./decisions/11-process-pages-at-publication.md)
registra a decisão histórica e as alternativas consideradas.

A [decisão sobre processamento somente de capas](./decisions/12-cover-only-processing-at-publication.md)
registra o fluxo atual de derivados para a leitura via Google Drive.

O [runbook de processamento de páginas](./runbooks/page-processing.md)
documenta migrações, scripts, variáveis de ambiente, verificações e recuperação.

O runbook distingue os comandos explícitos de migração e diagnóstico, que são
**somente de capas**, do worker de publicações, que gera gerações completas de
páginas para o leitor. Esses fluxos têm armazenamento, verificação e ciclo de vida
separados.

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
