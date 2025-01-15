# Uso de ADRs

## Contexto

Precisamos de uma forma mais robusta de registrar informações. Discutir apenas no Telegram não é eficiente e não gera documentação para uso futuro.

Além disso, precisamos de um registro para os famosos casos de "ué, porquê estamos fazendo A e não B?".

## Decisão

Decidimos usar Registros de Decisão Arquitetural (ADRs) para documentar as decisões técnicas ou não-técnicas.

## Alternativas Consideradas

- **Opção 1:** Não registrar decisões
  - **Prós:** Nenhum esforço inicial
  - **Contras:** Uma bagunça. Todo mundo fazendo de um jeito diferente e a informação se perdendo.
- **Opção 2:** Usar fontes externas, como Google Docs
  - **Prós:** Fácil de usar
  - **Contras:** Gestão de logins e separação do repositório – principal fonte de informação.
  
## Justificativa

ADRs são uma prática comum no mercado de desenvolvimento, e fazê-las localmente faz com que nós sejamos os donos da informação.

Como o formato é `.md`, qualquer pessoa pode adicionar ADRs e abrir PRs para discussão — facilitando o acesso.

## Consequências

- **Prós**
  - Organização
  - Documentação
  - Facilidade de acesso
- **Contras**
  - Documentar leva tempo
  - Pode ser um processo burocrático

## Links

- [Y-Statements](https://medium.com/olzzio/y-statements-10eb07b5a177)
- [ADRs no Github](https://adr.github.io/)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
