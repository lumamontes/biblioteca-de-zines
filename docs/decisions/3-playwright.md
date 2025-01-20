# Utilizar Playwright como ferramenta para testes E2E

## Contexto

Queremos configurar testes E2E na nossa aplicação para trazer mais confiança na nossa base de código e evitar problemas em produção.

## Decisão

Decidimos usar o [Playwright](https://playwright.dev/) para testes end to end, com o mínimo de cobertura sendo todas as páginas atuais da aplicação:

- Página de tela inicial
- Página de listagem de zines
- Página de detalhamento de zine

Para cada nova página será necessário adicionar testes para manter o mínimo de cobertura desejado.

## Alternativas Consideradas

- **Opção 1:** `Sem cobertura de testes`
  - **Prós:** Menor esforço inicial para desenvolvimento
  - **Contras:** Aplicação propensa a falhas
- **Opção 2:** `cypress`
  - **Prós:** Mantenedores possuem conhecimento prévio
  - **Contras:** Suporte limitado a múltiplos navegadores e performance lenta em comparação a outras ferramentas do ecossistema
  
## Justificativa

Escolhemos o Playwright porque ele oferece suporte a múltiplos navegadores, boa performance e uma API moderna, atendendo bem às nossas necessidades. Além disso, é usado por diversas empresas e projetos open-source modernos.


## Consequências

- **Prós**
  - Segurança para novos deploys
  - Maior confiabilidade
- **Contras**
  - Curva de aprendizado necessária para aprender a usar a ferramenta
  - Tempo maior de desenvolvimento para todas as tasks que necessitarem de testes

## Links

- [Documentação do Playwright](https://playwright.dev/)
- [Why we switched from Cypress to Playwright](https://www.bigbinary.com/blog/why-we-switched-from-cypress-to-playwright)
