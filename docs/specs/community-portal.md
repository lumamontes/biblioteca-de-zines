# Portal da comunidade da Biblioteca de Zines

Situação: especificação em revisão. O primeiro incremento está implementado em
`apps/community`, com dados locais e o GitHub simulado. Nenhum recurso de
produção foi criado.

Issue de origem: [#198](https://github.com/lumamontes/biblioteca-de-zines/issues/198).
Decisão arquitetural: [ADR 17](../decisions/17-independent-community-portal.md).

Neste documento, cada afirmação é marcada por tipo:

- **[código]**: evidência observada no repositório, com caminho;
- **[registrado]**: decisão já registrada em issue, ADR ou spec;
- **[recomendação]**: proposta nova desta spec, que precisa de revisão.

As verificações aparecem como **planejada** ou **executada**. Só os resultados
marcados como executados contam como evidência.

---

## 1. Descoberta e decisões

### 1.1 Como o repositório se organiza hoje

| Tema | Evidência | Tipo |
|---|---|---|
| Workspace | `pnpm-workspace.yaml` inclui `apps/*` e `packages/*`. `turbo.json` executa `build`, `check-types`, `test` e `test:application` em todos os pacotes. | [código] |
| Aplicações independentes | [ADR 16](../decisions/16-monorepo.md): cada aplicação mantém dependências, configuração e deploy próprios. Contratos compartilhados vão para `packages/`. | [registrado] |
| Catálogo | `apps/web` (Next 15, Tailwind, Supabase). Domínio em `src/domain`, casos de uso em `src/application`, adaptadores em `src/infrastructure`, montagem em `src/composition`, UI em `src/components`. | [código] |
| Visualizador | `apps/viewer` (Next 15 sem Tailwind, CSS próprio em `src/app/globals.css`). Rotas `/p/[slug]` e `/embed/p/[slug]`. Não guarda segredos (`apps/viewer/env.example`) e tem `vercel.json` próprio, que instala a partir da raiz. | [código] |
| Idioma | Identificadores, arquivos e pastas em inglês (`reader-session.ts`, `public-reader-client.ts`). Interface em PT-BR (`lang="pt-BR"` em `apps/viewer/src/app/layout.tsx`). ADRs e changelog em português. Specs existentes em inglês (`docs/specs/isolated-bookreader-viewer-and-embed.md`). Esta spec está em PT-BR porque o pedido de origem exige. | [código] |
| Sufixos e limites | `AGENTS.md`: `*.service.ts`, `*.types.ts`, `*.config.ts`, `*.helpers.ts`, `*.component.tsx`, `*.repository.ts`. Arquivos de tipos não têm comportamento. | [registrado] |
| Testes | `node:test` executado com `tsx --test` (`apps/viewer/package.json`, script `test`). Playwright 1.49.1 para e2e (`apps/viewer/playwright.config.ts`). | [código] |
| CI | `.github/workflows/ci.yml`: `pnpm install --frozen-lockfile`, `pnpm check-types:all`, testes do viewer e do web, `pnpm test:application:all` (turbo) e `pnpm test:changelog`. Uma aplicação nova com scripts `check-types` e `test:application` entra na CI sem mudar o workflow. | [código] |
| Deploy | `vercel.json` (catálogo) e `apps/viewer/vercel.json` (projeto Vercel separado, `viewer.biblioteca-de-zines.com.br`). Prévias da Vercel aparecem como status nos commits. | [código] |
| Identidade visual | Fonte Azeret Mono (`apps/web/src/app/layout.tsx`, `apps/viewer/src/app/layout.tsx`). Papel `#fafafa`, texto `#000`, bordas de 1 px pretas (`apps/viewer/src/app/globals.css`). Cores de marca em `apps/web/tailwind.config.ts`: verde `#1BEA2D`, amarelo `#FFF967`, azul `#9ED1FF`, azul-escuro `#2326D0`. | [código] |
| Navegação do catálogo | `apps/web/src/components/header.tsx` repete links no desktop e no menu móvel. | [código] |
| Consulta à comunidade | [ADR 8](../decisions/8-community-consultation-for-catalogue-policies.md): mantenedoras explicam decisões, e consulta não pede que a comunidade desenhe implementação. | [registrado] |
| Métricas | PR #200 conta aberturas por obra e dia, sem rastrear pessoas. | [código] |

### 1.2 Trabalho em andamento

Busquei branches, PRs abertos e referências à #198 em 21/11/2026. Não há PR
nem branch do portal. A única referência cruzada é a #202, que trata de
descoberta de zines e não do portal. **Executada.**

### 1.3 O que reutilizar

| Opção | Integração | Manutenção | Custo | Decisão |
|---|---|---|---|---|
| Next 15 nas mesmas versões do viewer | Usa pacotes que já estão no lockfile, sem dependência nova | Uma única versão de framework no monorepo | Zero | **[recomendação] adotar** |
| CSS próprio, como no viewer | Sem Tailwind e sem importar o catálogo | Poucos estilos, com tokens explícitos | Zero | **[recomendação] adotar** |
| Azeret Mono via `@fontsource/azeret-mono` (OFL), com `next/font/local` | Build sem acesso à rede, mesma fonte do catálogo | Arquivos versionados no app | Zero | **[recomendação] adotar** |
| GitHub Discussions | Nativo, mas exige conta no GitHub para participar | Baixa | Zero | Rejeitada: viola o requisito central |
| Giscus/Utterances | Exigem login no GitHub | Baixa | Zero | Rejeitadas pelo mesmo motivo |
| Fider, Canny, Discourse | Produtos completos de votação | Servidor próprio ou pago, segunda fonte de verdade | Hospedagem ou assinatura | Rejeitadas: duplicam decisões fora do GitHub |
| Webhooks do GitHub com reconciliação periódica | API REST do GitHub e GitHub App | Pouco código | Zero | **[recomendação] adotar** (seção 7) |
| Supabase existente, em schema isolado | Já é operado pela equipe | Separar papéis e migrações | Zero no plano atual | **[recomendação] para o incremento 2**. Decisão das mantenedoras (seção 10) |

### 1.4 ADR necessária

A escolha de uma aplicação independente que trata o GitHub como fonte de
verdade é duradoura e tem alternativas reais, por isso foi registrada na
[ADR 17](../decisions/17-independent-community-portal.md). A identificação
de votantes e a persistência de produção ficam nesta spec como recomendações,
porque dependem das mantenedoras.

---

## 2. Público, domínio e limites

### 2.1 Para quem é

O portal é para quem lê, cria ou envia zines e quer entender e influenciar
decisões da Biblioteca pelo celular, sem conta no GitHub. O acesso vem do
catálogo (link “Comunidade” no cabeçalho), da newsletter ou de um link
compartilhado.

A pergunta que avalia o piloto é: **qual contribuição esclareceu uma
necessidade, alterou uma prioridade ou mudou a solução?**

### 2.2 Percursos

**Primeira visita** (por exemplo, pela newsletter):

1. Abre `/proposals/1-o-que-voce-gostaria-de-conferir-antes-de-enviar-sua-zine`.
2. Lê no topo a pergunta, a etapa (“Em conversa”) e “O que está em aberto”.
3. Vota a favor ou contra. O botão anuncia o estado (“Você apoiou esta
   proposta”).
4. Escreve um comentário, lê o aviso de publicação no GitHub antes de enviar,
   escolhe um nome de exibição e envia.
5. Vê o comentário com a situação de envio (“Enviando…”, “Publicado no
   GitHub”, “Não foi possível publicar. Seu texto foi guardado”).

**Retorno a uma conversa:**

1. Volta ao mesmo endereço. Se o título público mudou, o slug antigo
   redireciona para o atual (308).
2. O voto já registrado aparece marcado, porque o navegador guarda um
   identificador anônimo.
3. A resposta oficial aparece logo abaixo da pergunta, com rótulo, autoria e
   link para o comentário no GitHub. Se a proposta foi decidida, resultado,
   justificativa e próximos passos ficam no topo.

**Manutenção:**

1. Entra em `/triage`. No piloto local, a entrada usa uma mantenedora de
   fixture. Em produção, exige login com GitHub (incremento 3).
2. Vê as sugestões em triagem, os envios com falha e os avisos de
   inconsistência.
3. Vincula uma sugestão a uma issue existente ou cria uma issue nova. Responde
   oficialmente **no GitHub**, pelo link “Responder na issue”.
4. Modera contribuições e registra quais delas influenciaram a decisão.

### 2.3 Glossário

| Termo da comunidade | Nome no código | Regra |
|---|---|---|
| Proposta | `Proposal` | Uma única entidade, com número permanente (`proposal.number`) e endereço `/proposals/{number}-{slug}`. Existe antes e depois do vínculo. |
| Sugestão (em triagem) | `Proposal` com `origin: 'community'` e `principalIssue: null` | É a mesma proposta numa fase anterior ao vínculo, não uma entidade separada. |
| Pergunta em discussão | `Proposal` com `origin: 'team'` | Criada pela equipe a partir de uma issue, com título e pergunta públicos. |
| Relato original | `Proposal.originalReport` | Texto e nome de quem sugeriu. Não muda depois de enviado. Ninguém pode editá-lo. A moderação do relato (ocultar) fica para o incremento 2. |
| Issue principal | `PrincipalIssue` | A única issue em que a conversa continua e a equipe responde. Uma proposta tem no máximo uma. |
| Tarefa relacionada | `RelatedTask` | Issue de implementação associada. Aparece como detalhe técnico. Não recebe comentários do portal. |
| Contribuição | `Contribution` | Comentário da comunidade. Antes do vínculo fica só no portal. Depois do vínculo, segue para a issue principal uma única vez. |
| Voto | `Vote` | Sinal de interesse (+1 ou −1), um por votante e proposta. Pode ser alterado ou retirado. Não decide prioridade sozinho. |
| Resposta oficial | `OfficialResponse` | Comentário de mantenedora na issue principal, marcado pela convenção da seção 3.5. Tipos: `answer` (resposta), `update` (atualização), `decision` (decisão). |
| Etapa | `Stage` | Representação pública única do andamento (seção 2.5). É diferente do estado técnico da issue (`open`/`closed`). |
| Situação de envio | `DeliveryState` | Confirmação de que uma contribuição chegou à issue: `local`, `pending`, `sent`, `failed`, `cancelled`. Não é uma etapa. |
| Influência registrada | `Influence` | Marcação da equipe dizendo que uma contribuição esclareceu a necessidade, alterou a prioridade ou mudou a solução. |
| Liberação | `ReleaseConfirmation` | Prova de que a melhoria está em uso, ou seja, deploy de produção bem-sucedido de um commit que contém o PR. Só ela habilita “Disponível na Biblioteca”. |

### 2.4 Sugestão e proposta são a mesma entidade

**[recomendação]** Sugestão e proposta são fases de `Proposal`. Isso preserva:

- **Identidade:** o `number` é atribuído pelo portal na criação e nunca muda.
  Não é o número da issue, porque a issue pode não existir ainda ou ser
  trocada na triagem.
- **Endereço:** `/proposals/{number}-{slug}`. O portal resolve a rota só pelo
  `number`. Qualquer slug diferente do atual redireciona com 308, então links
  compartilhados continuam funcionando depois de editar o título.
- **Histórico:** relato original, contribuições e votos continuam ligados à
  proposta. O vínculo acrescenta `principalIssue` e não move dados.

### 2.5 Etapa, estado da issue e confirmação de envio

São três conceitos diferentes, e a interface nunca os mistura:

| Etapa pública (`Stage`) | Rótulo | Origem |
|---|---|---|
| `triage` | Recebida, em triagem | Portal: sem issue principal |
| `discussion` | Em conversa | GitHub: issue aberta sem rótulo de etapa ou com `portal:discussion` |
| `decided` | Decidida: vamos fazer | GitHub: rótulo `portal:decided` |
| `in_progress` | Em desenvolvimento | GitHub: rótulo `portal:in-progress` |
| `available` | Disponível na Biblioteca de Zines | GitHub: issue fechada como `completed` e `ReleaseConfirmation` presente |
| `not_planned` | Não vamos seguir agora | GitHub: issue fechada como `not_planned` ou rótulo `portal:not-planned` |
| `archived` | Arquivada | Portal: sugestão encerrada na triagem sem issue (duplicada ou fora do escopo), com justificativa |

O estado técnico (`open`/`closed`, `state_reason`) aparece só nos detalhes
técnicos. A situação de envio aparece só em cada contribuição.

Regras de derivação (`deriveStageFromIssue`, em `apps/community/src/domain/stage.service.ts`):

1. Sem issue principal, a etapa vem do portal (`triage` ou `archived`).
2. Issue fechada como `not_planned` resulta em `not_planned`.
3. Issue fechada como `completed` com liberação confirmada resulta em
   `available`.
4. Issue fechada como `completed` sem liberação resulta em `in_progress`, com o
   aviso “Concluída no GitHub, aguardando liberação”.
5. Issue aberta segue o rótulo `portal:*`. Rótulos terminais numa issue aberta
   geram aviso de inconsistência na triagem e resultam em `discussion`.
6. Se houver mais de um rótulo `portal:*`, vale o mais avançado, e a triagem
   recebe um aviso.

### 2.6 Transições

| Evento | Ator autorizado | Condição | Origem do dado | Efeito visível |
|---|---|---|---|---|
| Sugerir | Qualquer pessoa | Título de 8 a 140 caracteres, relato de até 4.000, nome de exibição | Portal | Nova proposta em `triage`, com endereço permanente |
| Vincular a issue existente | Mantenedora | Proposta em `triage`, issue existe no repositório configurado | Portal + GitHub | Etapa passa para a derivada da issue. Link para a issue aparece no portal. Comentário com link para o portal aparece na issue |
| Criar issue e vincular | Mantenedora | Mesma condição. Idempotente pela chave de vínculo | Portal + GitHub | Igual ao anterior. Repetir a operação não cria segunda issue |
| Apresentar issue como pergunta | Mantenedora | Issue com bloco `portal` (seção 3.3) | GitHub | Nova proposta `origin: 'team'`, em `discussion` |
| Associar tarefa relacionada | Mantenedora | Proposta vinculada | Portal | Tarefa listada em “Detalhes técnicos” |
| Responder oficialmente | Mantenedora | Comentário na issue principal com marcador | GitHub | Resposta aparece com rótulo, autoria e link |
| Decisão fundamentada | Mantenedora | Rótulo `portal:decided` e comentário `Decisão da Biblioteca` | GitHub | Topo da proposta mostra resultado, justificativa e próximos passos. Sem o comentário, a triagem avisa “falta justificativa” |
| Não seguir | Mantenedora | Fechar como `not_planned` e publicar decisão | GitHub | Etapa `not_planned`. Votos ficam encerrados. A justificativa fica no topo |
| Arquivar sugestão | Mantenedora | Proposta em `triage`, com justificativa obrigatória | Portal | Etapa `archived`, justificativa pública, votos encerrados |
| Reabrir | Mantenedora | Reabrir a issue no GitHub ou desarquivar no portal | GitHub ou portal | Volta para `discussion` ou `triage`. Votos reabrem. O histórico de decisões continua visível |
| Liberar | Sistema | Deploy de produção bem-sucedido contendo o PR ligado à issue fechada | GitHub (Deployments) | Etapa `available` e “Disponível na Biblioteca” com data |
| Moderar contribuição | Mantenedora | Contribuição visível | Portal + GitHub | Oculta no portal. No GitHub, o texto é substituído por aviso de remoção (seção 7.5) |

---

## 3. Requisitos funcionais e autoridade dos dados

### 3.1 Requisitos funcionais

Prioridade: **P0** = obrigatório no piloto, **P1** = desejável no piloto,
**P2** = depois do piloto.

| ID | Ator | Resultado observável | Critério de aceite | Prioridade | Incremento |
|---|---|---|---|---|---|
| RF-01 | Visitante | Encontra o portal pelo catálogo | Link “Comunidade” no cabeçalho do catálogo, no desktop e no móvel, quando `NEXT_PUBLIC_COMMUNITY_URL` está definido | P0 | 1 |
| RF-02 | Visitante | Abre uma proposta por link compartilhado | `/proposals/{n}-{slug}` responde 200. Slug antigo ou ausente redireciona com 308 para o atual | P0 | 1 |
| RF-03 | Visitante | Sugere uma melhoria | Formulário com título, relato e nome. Funciona sem JavaScript (**executada**). Leva ao endereço da nova proposta | P0 | 1 |
| RF-04 | Visitante | Apoia uma proposta (▲) ou retira o apoio, no mural ou na proposta | Um apoio por votante e proposta. Apertar de novo retira. Não há voto contra (decisão das mantenedoras, 22/11/2026). O estado é anunciado por `aria-pressed`. Funciona sem JavaScript (**executada**) | P0 | 1 |
| RF-05 | Visitante | Comenta | Aviso de publicação visível antes do botão. Rascunho preservado em falha. Situações pendente, publicada e com falha exibidas. Funciona sem JavaScript (**executada**) | P0 | 1 |
| RF-06 | Visitante | Tenta reenviar sem duplicar | Repetir o envio usa a mesma chave de idempotência. A issue recebe um único comentário | P0 | 1 |
| RF-07 | Visitante | Encontra resposta e etapa no mesmo endereço | Resposta oficial e etapa aparecem depois da sincronização, sem edição manual no portal | P0 | 1 (fixture), 2 (real) |
| RF-08 | Mantenedora | Vincula a sugestão a uma issue existente ou nova | Relato, votos, conversa e endereço preservados. Links nos dois sentidos. Operação idempotente | P0 | 1 (fixture), 2 (real) |
| RF-09 | Mantenedora | Apresenta uma issue como pergunta | Bloco `portal` na issue cria ou atualiza a proposta. Mudar o título preserva o endereço | P0 | 2 |
| RF-10 | Mantenedora | Responde oficialmente pelo GitHub | Só comentários de mantenedoras autorizadas e com marcador aparecem como resposta oficial | P0 | 1 (fixture), 2 (real) |
| RF-11 | Mantenedora | Modera uma contribuição | Oculta no portal e cancela ou substitui a cópia no GitHub | P0 | 1 |
| RF-12 | Mantenedora | Vê falhas pendentes e reprocessa | Painel lista contribuições `failed`. Reenvio sem duplicar | P0 | 1 |
| RF-13 | Mantenedora | Registra influência | Marca a contribuição com tipo de influência. O registro aparece publicamente | P1 | 1 |
| RF-14 | Sistema | Mostra PRs relacionados como detalhe técnico | PRs que citam a issue aparecem recolhidos em “Detalhes técnicos” | P1 | 2 |
| RF-15 | Sistema | Confirma liberação | “Disponível na Biblioteca de Zines” só aparece com `ReleaseConfirmation` | P0 | 1 (regra), 2 (dados reais) |
| RF-16 | Mantenedora | Entra com GitHub | OAuth do GitHub App. Autorização verificada no servidor | P0 para produção | 3 |
| RF-17 | Visitante | Recupera o voto em outro aparelho | Código de retorno opcional | P2 | — |

### 3.2 Matriz de autoridade dos dados

| Informação | Origem (fonte de verdade) | Quem pode alterar | Cópia local permitida | Direção de sincronização | Recuperação após falha |
|---|---|---|---|---|---|
| Número e endereço da proposta | Portal | Ninguém (imutável) | Sim, é o próprio dado | — | Backup do banco |
| Título e pergunta públicos (proposta vinculada) | Bloco `portal` na issue principal | Mantenedoras no GitHub | Sim, em cache | GitHub → portal | Reconciliação periódica refaz o cache |
| Título e pergunta (sugestão antes do vínculo) | Portal | Quem sugeriu: não. Mantenedoras: só o título público, na triagem | Sim | — | Backup |
| Relato original | Portal | Ninguém. Moderação apenas oculta | Sim | — | Backup |
| Contribuição antes do vínculo | Portal | Moderação apenas oculta | Sim | — | Backup |
| Contribuição depois do vínculo | Portal até `sent`, depois o comentário no GitHub | Moderação (portal e GitHub) | Sim, com `githubCommentId` | Portal → GitHub (uma vez) e GitHub → portal (exclusão e edição) | Caixa de saída com chave de idempotência (seção 7.4) |
| Voto | Portal | O votante (identificador anônimo) | Sim, é o próprio dado | — | Backup. Não vai para o GitHub |
| Resposta oficial, atualização e decisão | Comentário na issue principal | Autora no GitHub | Sim, em cache com `verifiedAt` | GitHub → portal | Reconciliação. Comentário excluído no GitHub some do portal |
| Etapa | Rótulos, estado e liberação no GitHub | Mantenedoras no GitHub | Sim, em cache, derivada | GitHub → portal | Reconciliação |
| Tarefas relacionadas e PRs | GitHub (eventos cruzados) e vínculo de tarefa feito no portal | Mantenedoras | Sim, em cache | GitHub → portal | Reconciliação |
| Liberação | GitHub Deployments (ambiente `Production`) | Sistema de deploy | Sim, em cache | GitHub → portal | Reconciliação |
| Moderação | Portal | Mantenedoras | Sim | Portal → GitHub (substituição de texto) | Fila de ações com reprocessamento |
| Influência registrada | Portal | Mantenedoras | Sim | — | Backup |
| Lista de mantenedoras | Configuração da instalação (`COMMUNITY_MAINTAINERS`) e permissão no repositório | Administração do repositório | Não | — | — |

### 3.3 Do GitHub para a comunidade: bloco `portal` na issue

**[recomendação]** A equipe acrescenta ao corpo da issue um bloco oculto que o
GitHub não renderiza:

```markdown
<!-- portal
title: O que você gostaria de conferir antes de enviar sua zine?
question: Antes de enviar o formulário, o que você precisa ver: a capa, os créditos, a ordem das páginas ou outra coisa?
open-decision: Quais informações a prévia da submissão deve mostrar primeiro.
-->
```

- Na próxima sincronização, o bloco cria a proposta (`origin: 'team'`).
- Se o título técnico da issue mudar, nada muda no portal, porque o portal só
  lê o bloco.
- Se `title` mudar, o slug muda e o slug antigo redireciona. O `number`
  continua o mesmo.
- Se `question` ou `open-decision` mudarem, o texto é atualizado com o aviso
  “Pergunta atualizada em DATA”, e o texto anterior fica no histórico da
  proposta.
- Se o bloco for removido, a proposta sai da lista e o endereço continua
  respondendo com a última versão e o aviso “A equipe deixou de apresentar
  esta pergunta”.

### 3.4 Contribuição depois do vínculo

1. Antes do envio, a pessoa lê: “Seu comentário e o nome de exibição serão
   publicados na issue #184 do GitHub, que é pública. Não inclua dados
   pessoais.”
2. O cliente cria a chave de idempotência (`contributionId`) uma vez por
   rascunho e a guarda junto com o texto em `localStorage`.
3. O servidor grava a contribuição como `pending` e responde imediatamente.
4. O envio para o GitHub publica o corpo com o marcador
   `<!-- portal:contribution:{id} -->`.
5. Sucesso grava `sent` com `githubCommentId` e URL. Falha grava `failed` com
   uma mensagem compreensível, e o rascunho continua no navegador.
6. Reenviar consulta primeiro os comentários da issue em busca do marcador. Se
   o comentário já existe (confirmação perdida), grava `sent` sem publicar de
   novo.

### 3.5 Resposta oficial: convenção e autorização

**[recomendação]** A convenção é visível e legível nas duas superfícies: a
primeira linha não vazia do comentário é um título.

| Primeira linha | Tipo |
|---|---|
| `### Resposta da Biblioteca de Zines` | `answer` |
| `### Atualização da Biblioteca de Zines` | `update` |
| `### Decisão da Biblioteca de Zines` | `decision` (justificativa; opcionalmente `#### Próximos passos`) |

O leitor também aceita a forma curta (`### Resposta da Biblioteca`), para não
perder respostas escritas antes da convenção.

Verificação no servidor, a cada sincronização:

1. o login do autor está em `COMMUNITY_MAINTAINERS`;
2. `author_association` é `OWNER`, `MEMBER` ou `COLLABORATOR`;
3. o comentário está na issue principal, e não numa tarefa relacionada.

Casos de borda:

- **Edição no GitHub:** o portal atualiza o texto e mostra “editada”.
- **Exclusão no GitHub:** a resposta sai do portal na próxima sincronização.
- **Perda de acesso:** respostas publicadas enquanto a pessoa era mantenedora
  continuam visíveis, porque `verifiedAt` é anterior à perda. Comentários
  novos dessa pessoa não são aceitos.
- **Reabertura:** respostas anteriores continuam, e a etapa volta a
  `discussion`.
- **Quem não é mantenedora usa o marcador:** o comentário é ignorado como
  resposta oficial e gera um aviso na triagem.

O portal não tem formulário de resposta oficial. O botão da triagem leva à
issue principal.

### 3.6 Apoios (votos)

O prompt pedia votos a favor e contra. As mantenedoras decidiram manter só o
apoio (▲): é menos atrito, e o voto contra não ajuda a decidir num mural da
comunidade. O domínio ainda aceita o valor −1, mas a interface e as rotas só
enviam apoio.


| Alternativa | Atrito | Pseudonimato | Abuso | Troca de dispositivo | Desfazer |
|---|---|---|---|---|---|
| **Identificador anônimo em cookie (recomendado)** | Nenhum | Total: o servidor guarda só um HMAC | Médio: limpar cookies permite votar de novo | Não acompanha | Sim, no mesmo navegador |
| Cookie com código de retorno opcional | Baixo, opcional | Total | Médio | Sim, com o código | Sim |
| Link por e-mail | Alto (sair do site, esperar e-mail) | Baixo: guarda e-mail | Baixo | Sim | Sim |
| SMS | Alto, com custo | Nenhum | Baixo | Sim | Sim |
| Impressão digital do navegador | Nenhum | Baixo e invasivo | Médio | Não | Instável |
| Login com GitHub | Exclui o público-alvo | Depende | Baixo | Sim | Sim |

**Garantia real do mecanismo recomendado:** no máximo um voto contado por
navegador e proposta enquanto o cookie existir. Não garante uma pessoa = um
voto. Por isso a interface diz “Os votos ajudam a equipe a perceber interesse.
Eles não decidem sozinhos”, e a triagem cruza votos com relatos (por exemplo,
#89 com poucos votos e alto impacto).

Detalhes: cookie `bz_participant` com 128 bits aleatórios, `HttpOnly`,
`SameSite=Lax`, `Secure` em produção e duração de 1 ano. O banco guarda
`HMAC-SHA256(token, COMMUNITY_VOTER_SECRET)`. Votos ficam encerrados nas
etapas `available`, `not_planned` e `archived`.

---

## 4. Experiência visual e conteúdo

### 4.0 Princípio: um mural da Biblioteca de Zines

**[recomendação aprovada]** A comunidade é uma página própria, com a voz da
home da Biblioteca de Zines:

- **Cabeçalho do catálogo:** Zines, Sobre, Clube de Zines, Publicações,
  Comunidade e Sugerir Zine, com “Comunidade” como página atual. Abaixo de
  768 px, os links ficam num menu, como no catálogo.
- **Botão preto em maiúsculas com “:)”,** como o “EXPLORAR :)” da home:
  “SUGERIR UMA IDEIA :)”, “COMENTAR :)” e “ENVIAR :)”.
- **Propostas como post-its de papel,** nas cores da marca, levemente
  inclinados, como o post-it da zine em destaque na home.
  - A textura de papel é desenhada com ruído SVG (`feTurbulence`) no próprio
    CSS, sem imagem externa nem licença.
  - Cada post-it tem uma faixa de cola no topo e o canto de baixo levantado.
  - Sugestões novas aparecem em papel branco preso com fita crepe.
  - O que já está no ar aparece em verde.
  - As demais alternam amarelo e azul pelo número, então cada post-it mantém a
    cor em todas as páginas.
- **Sem etiquetas, abas ou explicações.** No post-it ficam só o título, o
  apoio (▲ e o número) e a contagem de comentários.
- **Palavras simples:** “comentários” e “Sugerir uma ideia”. O apoio é só um
  ▲ com o número. “Biblioteca de Zines” aparece sempre por extenso.
- **Conteúdo das issues reais:** impressão de zines (#197), prévia do
  formulário (#184), navegação por teclado (#89), aviso de zine publicada (#46)
  e a leitura nova, já no ar (#191).

### 4.1 Mural (`/`)

```text
┌──────────────────────────────┐
│ Biblioteca de Zines     Menu │
├──────────────────────────────┤
│ Comunidade                   │
│ O que a Biblioteca de Zines  │
│ deve fazer agora? Apoie as   │
│ ideias que você quer ver e   │
│ comente.                     │
│ [ SUGERIR UMA IDEIA :) ]     │
│                              │
│  ╱‾‾‾‾‾‾‾‾‾╲  ╱‾‾‾‾‾‾‾‾‾╲    │
│ │Baixar     │ │Navegar    │  │
│ │zines para │ │pelo site  │  │
│ │imprimir   │ │usando o   │  │
│ │[▲ 7]      │ │[▲ 0]      │  │
│ │0 coment.  │ │0 coment.  │  │
│  ‾‾‾‾‾‾‾‾‾‾‾   ‾‾‾‾‾‾‾‾‾‾‾   │
└──────────────────────────────┘
```

No desktop, cabem de três a quatro post-its por linha. No celular, cabem dois.

**Como equilibrar propostas novas, populares e sem votos:** a ordem não segue
os apoios.

1. Primeiro vêm as perguntas da equipe (`portal:featured`).
2. Depois, as demais conversas, pela última atividade.
3. Depois, as sugestões novas.
4. Por fim, o que já foi decidido.

Assim, a #89 aparece logo no começo, mesmo com zero apoios.

### 4.2 Proposta (`/proposals/1-...`)

```text
← Comunidade
 ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲
│ O que você gostaria de conferir      │
│ antes de enviar sua zine?            │
│ Antes de enviar o formulário, o que  │
│ você precisa ver: a capa, os …       │
│ Ainda estamos decidindo: quais …     │
 ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
[▲ 12]  Apoie se você também quer isso.

A Biblioteca de Zines respondeu
 (post-it azul) lumamontes · 20 de novembro
 Obrigada pelos relatos. A prévia vai começar …
 ver no GitHub

Comentários (2)
Coletivo Maré · 19 de novembro
Quero conferir se o nome do coletivo aparece nos créditos.
✓ ajudou a decidir: esclareceu uma necessidade
- - - - - - - - - - - - - - - - - - - -

Comentar
Comentário [                       ]
Seu nome (pode ser apelido) [      ]
Seu comentário e seu nome ficam públicos aqui e na issue #184 do GitHub.
[ COMENTAR :) ]

▸ Detalhes técnicos
```

A página tem uma coluna de até 560 px, como a página “Sobre”. Numa proposta
decidida, a decisão aparece em verde no topo de “A Biblioteca de Zines
respondeu”, com os próximos passos.

### 4.3 Nova ideia (`/suggest`)

Os campos são “Sua ideia em uma frase”, “Conte mais” e “Seu nome (pode ser
apelido)”. Antes do botão **ENVIAR :)**, a página avisa: “Sua ideia e seu nome
ficam públicos aqui”.

### 4.4 Triagem (`/triage`)

A triagem é só da equipe e funciona localmente. Ela usa os mesmos estilos, em
lista simples. Para cada sugestão, ela traz:

- vincular a uma issue ou criar uma;
- arquivar com justificativa.

Para cada proposta vinculada, ela traz:

- avisos;
- “Responder na issue”;
- moderar e registrar influência;
- o simulador do GitHub.

## 5. Responsividade como requisito de aceite

### 5.1 Princípios

- **O mural se reorganiza pelo espaço disponível:** de três a quatro post-its
  por linha no desktop e dois abaixo de 480 px. A proposta tem uma coluna de
  até 560 px. A ordem visual é a ordem do HTML.
- **Uma única quebra, a mesma do catálogo:** em 768 px (`md`), os links do
  cabeçalho viram o menu. O menu é um `<details>`, então funciona sem
  JavaScript.
- **Sem posicionamento fixo,** para que o teclado virtual não cubra o campo em
  foco nem as mensagens.
- **Estado preservado:** o endereço, o voto (no servidor) e o rascunho
  (`localStorage`, por proposta) não dependem do layout, então sobrevivem a
  rotação e redimensionamento.
- **Texto longo:** `overflow-wrap: anywhere` em títulos, nomes e URLs. Nenhum
  bloco tem altura fixa.

### 5.2 Matriz de verificação

| Largura (CSS px) | Por quê | Resultado esperado | Método |
|---|---|---|---|
| 320 | Mínimo e reflow (WCAG 1.4.10) | Sem rolagem horizontal. Marca e “Menu” sem cortes | Navegador automatizado |
| 390 | Celular comum | Sem rolagem horizontal. Alvos ≥ 24 px | Navegador automatizado |
| 767 | Imediatamente antes da quebra real | Menu visível, links do cabeçalho ocultos | Navegador automatizado |
| 768 | Na quebra real (`md` do catálogo) | Links do cabeçalho visíveis, menu oculto | Navegador automatizado |
| 1024 | Tablet em paisagem | Três post-its por linha | Navegador automatizado |
| 1440 e 1920 | Monitor largo | Mural limitado a 1000 px e coluna da proposta ≤ 560 px | Navegador automatizado |

### 5.3 Cenários e como verificar

| Cenário | Resultado esperado | Navegador automatizado | Inspeção manual |
|---|---|---|---|
| 320 px | Título, etapa e resposta quebram linha, sem rolagem horizontal | `scrollWidth` ≤ `clientWidth` | — |
| Retrato e paisagem com teclado virtual | É possível digitar, ler o aviso e enviar ou repetir | Aproximação com viewport de 390×300 | **Celular real** (iOS Safari e Android Chrome) |
| Tablet e janela dividida | Nenhuma ação só por hover | Capturas em 767 e 768 px | Janela dividida no iPad, se houver |
| Zoom de 200% e fonte maior | Conteúdo íntegro | Viewport de 640 px com fonte de 32 px | Zoom real no Safari e “Texto maior” no iOS |
| Conteúdo extremo | Título longo, apelido extenso, URL sem espaços, 40 comentários | `COMMUNITY_SEED=extreme` em 320, 390 e 1440 px | — |

## 6. Acessibilidade

Alvo: **WCAG 2.2 nível AA**.

| Percurso | Critérios | Como o portal atende |
|---|---|---|
| Abrir proposta | 1.3.1, 2.4.2, 2.4.6, 3.1.1 | `lang="pt-BR"`, `<title>` com o título da proposta, landmarks `header`/`main`/`footer`, um único `h1`, seções com `h2` |
| Navegar por teclado | 2.1.1, 2.4.3, 2.4.7, 2.4.11, 2.4.1 | Link “Pular para o conteúdo”. Foco com contorno de 3 px e deslocamento. Sem elementos fixos que cubram o foco |
| Votar | 4.1.2, 1.4.1, 2.5.8 | `<button aria-pressed>` com nome “Apoiar esta proposta, 12 votos a favor”. Estado em texto e ícone, não só em cor. Alvo mínimo de 44×44 px |
| Comentar | 3.3.1, 3.3.2, 3.3.3, 4.1.3, 1.3.5 | Rótulos visíveis. Aviso de publicação antes do botão, ligado por `aria-describedby`. Erros ligados ao campo. Situação anunciada em `role="status"` sem mover o foco. `autocomplete="nickname"` no nome |
| Recuperar erro | 3.3.1, 3.3.4 | Mensagem diz o que aconteceu e o que fazer, com o botão “Tentar de novo”. O rascunho continua |
| Ler resposta oficial | 1.3.1, 1.4.3 | Rótulo textual “Resposta oficial da Biblioteca” e autoria. Contraste de texto preto sobre `#9ED1FF` ≈ 13:1 |
| Movimento | 2.3.3 | Sem animações. `prefers-reduced-motion` respeitado por padrão |
| Contraste | 1.4.3, 1.4.11 | Texto `#000` sobre `#fafafa` ≈ 20:1. Bordas pretas. Sem cinza claro em texto |

**Verificações automáticas.** Executadas no incremento 1 com Chrome headless
(seção 9.3): um único `h1`, landmarks, `lang`, ordem dos títulos, aviso ligado ao
botão por `aria-describedby`, nome e estado dos botões de voto, anúncio de
falha em `role="status"` sem mover o foco, alvos de toque e reflow. Planejado
para o incremento 4: axe-core via Playwright nas rotas `/`, `/proposals/1-…`,
`/suggest` e `/triage`.

**Roteiro manual com teclado e VoiceOver no Safari do Mac** (planejado):

1. Abrir a newsletter de teste e seguir o link para a proposta #1.
2. `VO+U` → Títulos: confirmar `h1` com a pergunta e `h2` “Resposta da equipe”,
   “Conversa” e “Contribuir”.
3. `Tab` até “Apoiar esta proposta”: o VoiceOver anuncia nome, contagem e
   “não pressionado”. `Espaço` → “pressionado”. `Espaço` de novo retira.
4. `Tab` até o comentário. Antes de chegar ao botão, o aviso de publicação já
   foi lido como descrição.
5. Enviar com a falha simulada (`COMMUNITY_GITHUB_FAILURE=lost-confirmation`):
   o VoiceOver anuncia “Não foi possível confirmar a publicação. Seu texto foi
   guardado.” sem mover o foco. Acionar “Tentar de novo”: anuncia “Publicado
   no GitHub”.
6. Localizar a resposta oficial por títulos.
7. Voltar à lista pelo link “Todas as propostas”.

**Validação de compreensão com alguém da comunidade** (planejada): depois de
chegar pela newsletter, a pessoa explica sem ajuda qual decisão está aberta,
onde o comentário dela vai aparecer e como vai encontrar a resposta. O registro
é anônimo, com respostas literais e pontos de confusão.

---

## 7. Desempenho, confiabilidade e operação

### 7.1 Requisitos não funcionais

| ID | Cenário | Alvo ou hipótese | Método | Sem linha de base |
|---|---|---|---|---|
| RNF-01 | HTML inicial da proposta | Título, pergunta, etapa e decisão no HTML do servidor | `curl` da rota e busca pelos textos. **Executada** no incremento 1 | — |
| RNF-02 | GitHub lento ou fora | Proposta sincronizada continua legível. Aviso “Atualizado com o GitHub em DATA” quando a última sincronização tem mais de 30 min | A leitura usa só a cópia local (implementado). Teste com gateway real que falha fica para o incremento 2 | Começar com 30 min e ajustar depois de um mês de logs |
| RNF-03 | JavaScript | Lista sem JS de cliente além do runtime do Next. Detalhe com só os componentes de voto e comentário como ilhas de cliente | Tamanho dos chunks no `next build`. **Executada:** First Load JS de 109 kB na lista e 111 kB no detalhe, dos quais 105 kB são o runtime compartilhado do Next (saída do `next build`, 21/11/2026) | Primeira medição vira a linha de base. Regressão acima de 20% bloqueia |
| RNF-04 | Transferência com cache frio, conversa longa (40 contribuições) | Hipótese: ≤ 250 KB comprimidos | Lighthouse/DevTools com 4G lento | Medir no incremento 2. Até lá, é hipótese |
| RNF-05 | Campo (p75) | LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 | Vercel Speed Insights, quando houver amostra | Sem amostra, valem só os alvos de laboratório |
| RNF-06 | Laboratório | Lighthouse móvel (Moto G Power, 4× CPU, 4G lento): LCP ≤ 2,5 s, TBT ≤ 200 ms, CLS ≤ 0,1 | Script reproduzível no incremento 2 | — |
| RNF-07 | Carregar mais comentários | Posição de leitura preservada | No piloto, todos os comentários são renderizados no servidor. Paginação só acima de 100, com “Ver anteriores” que insere acima sem mover a rolagem | — |
| RNF-08 | Duplicidade | Zero comentários duplicados na issue por contribuição | Testes de serviço com confirmação perdida. **Executada** | — |
| RNF-09 | Custo | Infraestrutura recorrente perto de zero | Vercel Hobby, GitHub Actions e banco existente | — |

### 7.2 Renderização

| Opção | Prós | Contras | Decisão |
|---|---|---|---|
| Renderização no servidor a cada requisição | Sempre atual | Chama o banco em toda visita | Para a página de detalhe, que tem voto pessoal |
| Geração estática (SSG) | Rápida | Votos e conversa ficam velhos | Não |
| ISR com revalidação sob demanda | Rápida, e a sincronização invalida o cache | Mais uma peça para entender | **[recomendação]** para a lista no incremento 2 (`revalidatePath` depois da sincronização) |

Nos dois casos, a fonte da leitura é a **cópia local sincronizada**, nunca o
GitHub ao vivo. É isso que mantém a leitura disponível durante lentidão do
GitHub.

### 7.3 Sincronização

| Opção | Atraso | Falhas | Custo | Decisão |
|---|---|---|---|---|
| Só webhook | Segundos | Eventos perdidos não se recuperam | Zero | Não |
| Só consulta periódica | Minutos | Robusta, mas gasta limite de API | Zero | Não |
| **Webhook como gatilho e reconciliação periódica** | Segundos, com rede de segurança | Robusta | Zero (Actions agendada a cada 30 min) | **[recomendação]** |

Regras:

- **Fora de ordem ou atraso:** o webhook só diz qual issue mudou. O portal
  sempre busca o estado atual da issue (labels, comentários, eventos) e
  substitui o cache. Eventos antigos não sobrescrevem dados novos.
- **Prevenção de ciclos:** comentários com o marcador `portal:` cujo autor é o
  bot do app são ignorados na leitura de respostas e conversas.
- **Validação:** assinatura `X-Hub-Signature-256` verificada com comparação de
  tempo constante. Payload só lido depois da verificação. Repositório conferido
  com `COMMUNITY_GITHUB_REPOSITORY`.
- **Reconstrução:** o comando `sync:all` percorre as issues com bloco `portal`
  e as propostas vinculadas e refaz o cache. Votos e contribuições não são
  cache e não se perdem.

### 7.4 Falhas na escrita para o GitHub

| Falha | Detecção | Recuperação |
|---|---|---|
| GitHub responde erro (5xx, rate limit) | Resposta HTTP | `failed`, com reenvio pela pessoa ou pela triagem |
| Confirmação perdida (o comentário foi criado, mas a resposta não chegou) | Timeout | O reenvio procura o marcador antes de publicar e grava `sent` com o comentário encontrado |
| Processo cai entre gravar `pending` e publicar | Contribuições `pending`, ou `sending` sem resposta há mais de 5 min | `processOutbox` (botão na triagem; comando agendado no incremento 2) processa as pendentes com a mesma regra do marcador |
| Duas tentativas simultâneas | Rara no piloto | Trava otimista: `pending` → `sending` com `attempt` incrementado. Só quem conseguiu a transição publica |

### 7.5 Segurança, dados e moderação

- **Permissões do GitHub App:** Issues (leitura e escrita), Pull requests
  (leitura), Deployments (leitura) e Metadata (leitura), só no repositório
  configurado. Nada de Contents nem Administration.
- **No servidor:** toda ação de triagem verifica a sessão de mantenedora. No
  piloto local, `COMMUNITY_LOCAL_TRIAGE=1` só funciona fora de produção.
- **Contra spam:** campo isca e limites de tamanho (implementados). Limite de 5
  contribuições e 20 votos por votante a cada 10 min (incremento 2). Turnstile
  só se houver abuso (decisão das mantenedoras).
- **Dados mínimos:** nome de exibição, texto, HMAC do votante e datas. Sem
  e-mail, sem IP persistido e sem impressão digital.
- **Retenção:** conteúdo ocultado por moderação fica 30 dias para revisão e
  depois tem o texto apagado, mantendo só os metadados.
- **Remoção de comentário público pela equipe:**

| Cópia | O que acontece |
|---|---|
| Portal | Oculta na hora e mostra “Contribuição removida pela moderação” |
| Comentário no GitHub | O texto é substituído por “_Contribuição removida pela moderação da Biblioteca em DATA._”, mantendo o marcador |
| Envio ainda pendente | Cancelado (`cancelled`), sem publicação |
| Notificações já enviadas pelo GitHub | **Não podem ser recolhidas.** Por isso o aviso é mostrado antes do envio |
| Histórico de edição do GitHub | O texto anterior fica no histórico da edição. Para remover de vez, uma mantenedora apaga o comentário no GitHub. O portal detecta e grava `deleted_on_github` |

### 7.5.1 Auditoria do incremento 1 (22/11/2026)

**Corrigido**, com teste em `apps/community/test/security.test.ts`. Os dois
primeiros testes falhavam no código anterior à correção.

| Achado | Risco | Correção |
|---|---|---|
| Um comentário podia conter o marcador `<!-- portal:contribution:<id> -->` de outra contribuição pendente (os ids aparecem no HTML) | A nova tentativa da vítima “encontrava” o comentário do atacante e não publicava o dela | O texto da comunidade tem `<!--` escapado. A busca por marcador só considera comentários do bot do portal, com o marcador na primeira linha |
| Menções `@login` e referências `#123` no texto ou no nome iam para o GitHub como markdown ativo | Notificar qualquer pessoa no GitHub e escrever na linha do tempo de outras issues | Menções e referências são neutralizadas com um espaço de largura zero. O nome perde a sintaxe de markdown e HTML |
| Qualquer pessoa podia abrir uma issue com um bloco `<!-- portal -->` | A issue aparecia no mural como pergunta da equipe, ou mudava o título de uma proposta vinculada | O bloco só vale em issues escritas por mantenedoras (login na lista e associação OWNER, MEMBER ou COLLABORATOR) |
| Uma issue de terceiros com o marcador `<!-- portal:proposal:N -->` | Capturava “Criar issue e vincular”, ligando a proposta à issue do atacante | Só valem issues criadas pelo bot do portal, com o marcador na primeira linha |
| O `update:` do bloco ia para um link | Defesa em profundidade | Só aceita caracteres de slug |
| As rotas sem JavaScript montavam o `Location` com o segmento da URL | Cabeçalho malformado (500) com caracteres de controle | Redirecionam pelo número da proposta. A página acrescenta o slug atual |
| Sem `COMMUNITY_VOTER_SECRET` em produção, o HMAC usa um segredo público | Hashes de votante previsíveis | Aviso no log do servidor. A variável faz parte do deploy |

**Em aberto**, antes do GitHub real (incremento 2):

- **Limite de envios:** não há limite por votante nem por IP. Hoje dá para
  inflar apoios apagando o cookie ou mandando POSTs sem cookie, e cada envio
  sem cookie cria um votante novo. Com o gateway real, o mesmo vale para
  comentários publicados no GitHub. É preciso limitar por HMAC e por IP
  (Upstash ou tabela no banco) antes de ligar o GitHub real, e considerar
  Turnstile.
- **Triagem:** a triagem local não tem login. `COMMUNITY_LOCAL_TRIAGE=1` num
  deploy público deixa qualquer pessoa mexer nos dados de demonstração. Não
  ligue essa variável em deploy público até existir o OAuth (incremento 3).
- **Rotas sem JavaScript:** aceitam POST sem o cabeçalho `Origin`, o que
  cobre navegadores antigos. O cookie `SameSite=Lax` limita o impacto.
- **CSP:** mantém `'unsafe-inline'` para os scripts do Next. Trocar por nonce
  quando houver tempo.
- **Variável de build:** `NEXT_PUBLIC_COMMUNITY_ENABLED` é calculada no build
  do catálogo. Mudar `COMMUNITY_ORIGIN` exige um novo deploy do catálogo.
- **Envios pendentes:** nenhum job agendado reprocessa envios `pending`. Hoje
  só o botão da triagem faz isso. Fica para o incremento 2.

### 7.6 Operação

| Operação | Consumo | Monitoramento |
|---|---|---|
| Webhook | 1 chamada por evento e cerca de 3 leituras de API | Logs da Vercel. Alerta de erro 5xx |
| Reconciliação a cada 30 min | Cerca de 2 leituras por proposta ativa (dentro de 5.000 por hora) | Falha do job notifica por e-mail do Actions |
| Caixa de saída | 1 a 2 chamadas por contribuição | Painel “Envios com falha” na triagem e contagem na métrica M4 |

Procedimento para envios pendentes sem duplicação: no incremento 1, usar o botão
“Reenviar pendentes sem duplicar” da triagem (`processOutbox`). Ele reprocessa
`pending` e `failed` procurando o marcador antes de publicar, e é seguro repetir.
No incremento 2, o mesmo serviço vira o comando `outbox:retry`, agendado no
GitHub Actions, ao lado de `sync:all` para a reconciliação.

---

## 8. Organização no monorepo e futura extração

```text
apps/community/
├── src/
│   ├── domain/           # regras puras: etapa, votos, envio, slug, marcadores
│   ├── application/      # casos de uso: sugerir, votar, contribuir, vincular, moderar, sincronizar
│   ├── infrastructure/   # repositório em arquivo JSON, gateway do GitHub simulado
│   ├── composition/      # escolhe adaptadores por ambiente
│   ├── components/       # UI pública e de triagem
│   └── app/              # rotas Next e server actions finas
├── fixtures/             # propostas de exemplo (#184, #89, #186)
├── test/                 # node:test via tsx
├── env.example
└── vercel.json
```

- **Regras de participação:** `src/domain`.
- **UI pública:** `src/app/page.tsx`, `src/app/proposals`, `src/app/suggest`,
  `src/components/proposal` e `src/components/suggestion`.
- **Triagem:** `src/app/triage` e `src/components/triage`.
- **Persistência:** `src/infrastructure/*.repository.ts`.
- **Integração com o GitHub:** `src/infrastructure/github/*`.
- **Dependências:** nenhuma de `apps/web`, das tabelas de zines, autorias ou
  submissões. A instalação atende uma comunidade e um repositório. No
  incremento 1, o repositório vem do fixture do GitHub simulado. No incremento
  2, ele passa a vir de `COMMUNITY_GITHUB_REPOSITORY`.

**Implantação:** **[decidido em 22/11/2026]** o app tem projeto Vercel
próprio, como o visualizador, e é servido pelo catálogo em
`biblioteca-de-zines.com.br/comunidade`:

- **Na comunidade:** `basePath: '/comunidade'`.
- **No catálogo:** um rewrite de `/comunidade/*` para o deploy da comunidade,
  ligado por `COMMUNITY_ORIGIN`.

Para quem visita, é uma página da Biblioteca de Zines. No código, as duas
aplicações continuam independentes.

| Critério | Subdomínio próprio | Caminho no catálogo (`/comunidade`, escolhido) |
|---|---|---|
| Para quem visita | Parece outro site | Mesma Biblioteca de Zines, mesmo endereço |
| URLs permanentes | Estáveis e independentes do catálogo | Estáveis enquanto o rewrite existir. `/comunidade/issues/:número` dá um endereço estável por issue |
| Cookies | Isolados | Mesmo domínio. O cookie de voto (`bz_participant`) não colide com os do Supabase |
| Formulários | Sem configuração | `COMMUNITY_ALLOWED_ORIGINS` autoriza o host do catálogo nas server actions e nas rotas sem JavaScript |
| Desenvolvimento local | Porta 4200 sozinha | `pnpm dev:all` e http://localhost:3000/comunidade |
| Operação | Deploy separado | Deploy separado. Sem `COMMUNITY_ORIGIN`, o catálogo não mostra o link nem o rewrite |

**Ligação com as novidades do catálogo:**

- **Da comunidade para o catálogo:** o post-it verde “já está no ar” leva a
  `/publicacoes#novidade-<slug>` quando o bloco `portal` da issue tem
  `update: <slug>`. A página abre direto na aba Novidades.
- **Do catálogo para a comunidade:** a novidade com `communityIssue` mostra
  “Ver a conversa na comunidade”, que leva a `/comunidade/issues/<número>`.
- **O que não muda:** as novidades continuam no catálogo. A comunidade mostra
  o caminho da ideia até a entrega, sem duplicar o changelog.

**Adoção futura pelo Viveiro Digital** exigiria:

- configuração por instalação (repositório, nome da comunidade, textos e
  cores) em vez de constantes;
- tema por tokens;
- uma instalação por comunidade, que é mais simples do que multi-inquilino;
- documentação de instalação.

Podem esperar uma segunda comunidade: extração para repositório próprio,
pacote de tokens compartilhado, multi-repositório e internacionalização.

---

## 9. Métricas e incrementos demonstráveis

### 9.1 Indicadores

| ID | Pergunta | Fonte | Período | Denominador | Limitação |
|---|---|---|---|---|---|
| M1 | Quantas discussões nasceram da comunidade e quantas da equipe? | `Proposal.origin` | Mensal | Total de propostas criadas no período | Não mede qualidade |
| M2 | Que proporção recebeu resposta oficial? | `OfficialResponse` | Mensal | Propostas vinculadas e abertas no período | Depende de as mantenedoras usarem o marcador |
| M3 | Quanto tempo até a primeira resposta? | Criação da proposta → primeira `OfficialResponse` (mediana e p90) | Mensal | Propostas com resposta | Sugestões sem resposta saem do cálculo, então reportar junto com M2 |
| M4 | Quantos envios estão pendentes ou falharam? | `DeliveryState` | Contínuo | Contribuições depois do vínculo | — |
| M5 | Quais decisões foram influenciadas por contribuições? | `Influence` | Por decisão | Decisões publicadas | Registro manual da equipe |

Sem rastreamento individual: o painel só mostra agregados. O HMAC do votante
nunca aparece em relatórios.

**Percurso verificável para a newsletter:** cada `Influence` liga pergunta →
contribuição (link) → decisão (link para o comentário no GitHub). A página da
proposta mostra “Ajudou a decidir” na contribuição, e a newsletter pode citar
esses três links.

### 9.2 Incrementos

| Incremento | Entrega | Depende de | Critério de aceite | Paralelizável |
|---|---|---|---|---|
| **1. Portal local de ponta a ponta** (este PR) | Domínio, repositório JSON, gateway simulado, lista, detalhe, sugerir, votar, comentar com caixa de saída, triagem local, moderação, influência e link no catálogo | — | Os percursos A e B passam em testes de serviço. Build e capturas responsivas | — |
| 2. GitHub real | Gateway REST com GitHub App, webhook, reconciliação, bloco `portal`, PRs e liberação | Decisão sobre GitHub App e persistência | Os percursos A e B passam contra um repositório de testes | Banco (2a) e GitHub (2b) em paralelo |
| 2a. Persistência | Adaptador de banco para os mesmos contratos | Decisão de banco | Os mesmos testes de contrato do repositório JSON passam | Sim |
| 3. Login de mantenedoras | OAuth do GitHub App e verificação de permissão | 2b | Triagem inacessível sem sessão | Depois de 2b |
| 4. Medição e acessibilidade | Lighthouse reproduzível, axe, roteiro com VoiceOver e validação com a comunidade | 1 | Resultados registrados nesta spec | Sim, em paralelo a 2 |
| 5. Piloto | Publicar #184 e #186 e anunciar na newsletter | 2, 3, 4 | Primeira resposta oficial publicada | — |

**Percurso A** (exercitado em `test/journeys.test.ts`, **executada**): uma
pessoa abre a proposta #1 (#184) pelo celular, comenta “Quero conferir se o
nome do coletivo aparece nos créditos” e enfrenta confirmação perdida. Ao
tentar de novo, uma única contribuição chega à issue. A equipe responde com
`### Decisão da Biblioteca de Zines` e muda o rótulo para `portal:decided`. Depois da
sincronização, o mesmo endereço mostra a resposta e a etapa “Decidida”.

**Percurso B** (mesmo arquivo, **executada**): uma sugestão nasce no portal,
recebe votos e comentários e é vinculada à #186. O endereço e o histórico
continuam. Repetir o vínculo não cria outra issue. A equipe modera uma
contribuição e o teste verifica o efeito no portal e no comentário do GitHub
simulado.

### 9.3 Verificações do incremento 1

Executadas em 21/11/2026 sobre um build de produção (`next build`) do app.

| Verificação | Método | Estado |
|---|---|---|
| Tipos do portal e do catálogo | `tsc --noEmit` em `apps/community` e `apps/web` | **Executada**, sem erros |
| Regras de domínio, percursos A e B, idempotência do vínculo, autorização de respostas, perda de acesso, comentário apagado no GitHub, título editado, ordenação da lista, votos encerrados, reenvio seguro | `pnpm test` (14 testes em `test/`) | **Executada**, 14/14 |
| Build de produção | `next build` | **Executada**, sem erros |
| Lockfile | `pnpm install --frozen-lockfile --offline`: “Lockfile is up to date”. Um controle negativo com o importer renomeado falha com `ERR_PNPM_OUTDATED_LOCKFILE` | **Executada** |
| Changelog | `node --test scripts/changelog.test.mjs` | **Executada**, 2/2 |
| HTML inicial com título, etapa, pergunta, decisão em aberto e resposta oficial; slug antigo redireciona com 308 | `curl` contra `next start` | **Executada** |
| Matriz responsiva: 320, 390, 767, 768, 1024, 1440 e 1920 px × lista, proposta aberta, decidida, em triagem, sugerir e triagem, sem rolagem horizontal | Chrome headless (Playwright), `scrollWidth` contra `clientWidth` | **Executada**, 42/42 |
| Quebra do cabeçalho igual à do catálogo (menu em 767 px, links em 768 px) e coluna de leitura ≤ 768 px em 1440 px | Visibilidade e largura medidas no Chrome headless | **Executada** |
| Fonte de 32 px num viewport de 640 px (equivalente a 200% em 320 px) | Chrome headless | **Executada**, sem rolagem horizontal |
| Conteúdo extremo: título longo, pseudônimo extenso, URL sem espaços e 40 contribuições em 320, 390 e 1440 px | Chrome headless com `COMMUNITY_SEED=extreme` | **Executada** |
| Alvos de toque ≥ 24 px (WCAG 2.5.8); controles principais com 44 px | Medição dos retângulos a 390 px | **Executada** |
| Voto: nome “Apoiar 12 votos a favor”, `aria-pressed`, trocar e retirar, foco mantido | Chrome headless | **Executada** |
| Percurso A no navegador (390 px): confirmação perdida, rascunho preservado ao recarregar, foco no botão, “Tentar de novo”, uma única contribuição | Chrome headless com `COMMUNITY_GITHUB_FAILURE=lost-confirmation` | **Executada** |
| Percurso B no navegador: vínculo com a #186, nova tentativa sem duplicar o comentário de vínculo, resposta oficial e etapa no mesmo endereço | Chrome headless | **Executada** |
| Sem JavaScript: sugerir, votar, comentar e repetir após falha, com um único comentário na issue | Chrome headless com JavaScript desligado | **Executada** |
| POST sem JavaScript vindo de outra origem é recusado (403); da mesma origem, redireciona com 303 | `curl` com cabeçalho `Origin` | **Executada** |
| Catálogo real (`apps/web`, `next dev`) com `COMMUNITY_ORIGIN`: `/comunidade` responde 200 pelo rewrite, os arquivos estáticos carregam, o link “Comunidade” aparece no cabeçalho, `/comunidade/issues/191` redireciona (303) para a proposta, slug antigo redireciona (308) mantendo `/comunidade`, apoio sem JavaScript pelo catálogo volta ao mural (303), POST de outra origem recebe 403 | `curl` contra os dois apps rodando no Mac | **Executada** |
| Mural e formulários com `basePath`: sugerir com e sem JavaScript leva a `/comunidade/proposals/…`; o post-it verde aponta para `/publicacoes#novidade-leitura-com-mais-contraste` | Chrome headless | **Executada** |
| `/publicacoes#novidade-<slug>` abre a aba Novidades na novidade certa | Revisão de código. A página depende do Substack, que não carrega sem rede | **Planejada** (conferir no preview da Vercel) |
| Viewport baixo (390×300) como aproximação do teclado virtual: botão focado visível e sem elementos fixos | Chrome headless | **Executada** (aproximação) |
| Teclado virtual real em iOS e Android, VoiceOver no Safari do Mac, axe-core, Lighthouse móvel, validação de compreensão com a comunidade | Seções 5.3, 6 e 7.1 | **Planejada** |

Capturas do incremento 1 (Chrome headless, dados de exemplo):

- [Celular, 390 px: lista, proposta aberta e proposta decidida](./assets/community-portal/mobile-list-open-decided-390.png)
- [Desktop, 1280 px: lista](./assets/community-portal/desktop-list-1280.png)
- [Desktop, 1280 px: proposta aberta](./assets/community-portal/desktop-open-proposal-1280.png)
- [Celular: falha de confirmação recuperável e conteúdo extremo em 320 px](./assets/community-portal/mobile-recovery-and-extreme-content.png)
- [Desktop: triagem](./assets/community-portal/desktop-triage-1280.png)

O roteiro de navegador usado nestas verificações não foi versionado: ele rodou
fora do monorepo, contra um build standalone temporário. Transformá-lo em testes
Playwright em `apps/community/e2e` faz parte do incremento 4.

---

## 10. Escolhas que precisam das mantenedoras

1. **Persistência de produção:** schema isolado no Supabase existente
   (recomendado) ou banco separado.
2. **GitHub App:** criar o app `biblioteca-portal` com as permissões da seção
   7.5. Define a autoria dos comentários (`biblioteca-portal[bot]`).
3. **Convenções:** os rótulos `portal:*`, o bloco `portal` e os títulos de
   resposta oficial (seções 2.5, 3.3 e 3.5).
4. **Identificação de votantes:** cookie anônimo (recomendado) e, se for o
   caso, código de retorno.
5. **Endereço:** decidido como `biblioteca-de-zines.com.br/comunidade`. Falta criar o projeto na Vercel e definir `COMMUNITY_ORIGIN` no catálogo.
6. **Lista de mantenedoras** autorizadas a responder.
7. **Retenção** de conteúdo moderado (30 dias proposto) e uso de Turnstile.
