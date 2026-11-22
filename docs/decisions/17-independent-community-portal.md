# Portal da comunidade independente com o GitHub como fonte de verdade

Situação: proposta. O primeiro incremento está implementado localmente com
dados simulados e ainda não foi publicado.

## Contexto

Hoje, quem quer influenciar os rumos da Biblioteca precisa encontrar as
propostas no GitHub, no meio de tarefas técnicas, e precisa ter conta lá. A
[issue #198](https://github.com/lumamontes/biblioteca-de-zines/issues/198) pede
um portal em português em que a comunidade sugira, vote, comente e acompanhe
decisões pelo celular, sem conta no GitHub.

Ao mesmo tempo, as decisões e o andamento da equipe já são registrados no
GitHub, e não devem ser registrados duas vezes.

O catálogo (`apps/web`) e o visualizador (`apps/viewer`) já são aplicações
independentes no mesmo monorepo ([ADR 16](./16-monorepo.md)). O portal precisa
evoluir participação e moderação sem depender de uma versão nova do catálogo, e
pode ser adotado por outra comunidade no futuro.

## Decisão

1. Criar `apps/community`, uma aplicação Next independente, com
   dependências, configuração e deploy próprios, que não importa código nem
   tabelas do catálogo.
2. O GitHub é a fonte de verdade para decisões, etapa, respostas oficiais,
   PRs e liberação das propostas vinculadas. O portal guarda uma cópia
   sincronizada para leitura.
3. O portal é a fonte de verdade para propostas antes do vínculo, endereços
   permanentes, votos, moderação e registro de influência.
4. Sugestão e proposta são fases da mesma entidade, com número e endereço
   atribuídos pelo portal.
5. Depois do vínculo, cada contribuição é publicada uma única vez na issue
   principal, por uma caixa de saída idempotente com marcador no corpo do
   comentário.
6. Respostas oficiais são escritas apenas no GitHub, por mantenedoras
   autorizadas, com uma marcação textual no início do comentário.
7. Uma instalação atende uma comunidade e um repositório, configurado por
   variável de ambiente.

## Alternativas Consideradas

- **Rota dentro do catálogo (`apps/web`)**
  - **Prós:** um deploy só e descoberta natural.
  - **Contras:** acopla o portal a Tailwind, Supabase e ao ciclo de release do
    catálogo. Mistura cookies de visitantes anônimos com a sessão do catálogo e
    dificulta a extração.
- **GitHub Discussions, Giscus ou Utterances**
  - **Prós:** nenhuma infraestrutura.
  - **Contras:** exigem conta no GitHub, que é exatamente a barreira a remover.
- **Ferramenta de votação pronta (Fider, Canny, Discourse)**
  - **Prós:** recursos maduros.
  - **Contras:** viram uma segunda fonte de verdade para decisões, com custo ou
    servidor próprio, e em inglês.
- **O portal como fonte de verdade de tudo, com espelhamento no GitHub**
  - **Prós:** controle total da experiência.
  - **Contras:** a equipe passaria a registrar decisões em dois lugares, o que
    contraria a #198.

## Justificativa

A aplicação independente repete o padrão já validado pelo visualizador:
isolamento de runtime, deploy próprio e limites claros. Tratar o GitHub como
fonte de verdade mantém o trabalho da equipe num só lugar. Manter votos e
conversas antes do vínculo no portal permite participar sem conta no GitHub.
A caixa de saída idempotente resolve a exigência de não duplicar comentários
mesmo quando a confirmação se perde.

## Consequências

- **Positivas:**
  - O catálogo só ganha um link.
  - O portal pode ser publicado, revertido e extraído sozinho.
  - A comunidade participa sem conta no GitHub.
- **Negativas:**
  - Um projeto Vercel a mais.
  - Uma camada de sincronização a manter.
  - Convenções (rótulos `portal:*`, marcadores) que as mantenedoras precisam
    seguir no GitHub.
- **Ainda em aberto:**
  - Persistência de produção, GitHub App, domínio e identificação de
    votantes. As recomendações estão na spec.

## Links

- [Spec do portal da comunidade](../specs/community-portal.md)
- [Issue #198](https://github.com/lumamontes/biblioteca-de-zines/issues/198)
- [ADR 16: monorepo](./16-monorepo.md)
- [ADR 8: consulta à comunidade](./8-community-consultation-for-catalogue-policies.md)
