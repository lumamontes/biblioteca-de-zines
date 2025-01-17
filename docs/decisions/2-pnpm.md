# Uso de ADRs

## Contexto

Como todo projeto de Javascript, precisamos utilizar um gestor de packages. Essa ADR explica nossa escolha.

## Decisão

Decidimos usar [pnpm](https://pnpm.io/) como nosso gestor.

## Alternativas Consideradas

- **Opção 1:** `npm`
  - **Prós:** Tradicional e conhecido
  - **Contras:** Não tão rápido quanto o pnpm, além de ocupar bastante espaço — veja a justificativa do `pnpm` como comparação abaixo.
- **Opção 2:** `yarn`
  - **Prós:** Fácil de usar e a primeira alternativa ao `npm`
  - **Contras:** A versão 2.0 mudou completamente o formato de funcionamento, e ele não traz mais muitas melhoras em relação ao `npm`.
  
## Justificativa

`pnpm` é um package manager moderno, é utilizado e patrocinado por vários projetos grandes (Discord, Prisma, Vercel), traz velocidade e, principalmente, salva espaço.

Enquanto o `npm` cria uma pasta node_modules em todos os novos projetos, o `pnpm` utiliza um clone ou _hard link_ dos pacotes instalados.

Com `npm` ou `yarn`, se você tiver 10 projetos, você tem 10 pastas enormes de `node_modules`. Com `pnpm`, você tem uma pasta central conectada com — e não copiada a — cada projeto, salvando assim espaço local.

## Consequências

- **Prós**
  - Rapidez
  - Boa documentação
- **Contras**
  - Não encontramos contras.

## Links

- [pnpm](https://pnpm.io/)
- [Making the Switch: From Yarn/NPM to PNPM](https://www.raulmelo.me/en/blog/making-the-switch-to-pnpm)
