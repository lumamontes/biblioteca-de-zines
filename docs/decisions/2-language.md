# Idiomas utilizados no projeto

## Contexto

Como desenvolvedores brasileiros, precisamos criar convenções sobre quais idiomas utilizaremos em diferentes partes do projeto. Assim, não há confusão entre PRs em inglês e reviews em português, ou problemas com nomes de branches ou commits com caracteres que podem ser origem de bugs.

## Decisão

Decidimos separar do seguinte modo:

- Em português brasileiro:
  - PRs
  - Issues
  - Reviews
  - Comentários no GH
  - READMEs
- Em inglês:
  - código
  - variáveis
  - funções
  - branches
  - commits

Como observado, vamos manter os termos do GitHub em inglês (Issues, PRs, etc).

## Alternativas Consideradas

- **Opção 1:** Tudo em inglês
  - **Prós:** Segue o padrão internacional de aplicações open-source
  - **Contras:** Limita os colaboradores — quem não fala inglês (mas fala português) fica impossibilitado de participar de um projeto brasileiro. Utilizar inglês pra tudo fecha portas para colaborações.
- **Opção 2:** Tudo em português
  - **Prós:** Nosso idioma nativo
  - **Contras:** Caracteres do português brasileiro podem dar problemas ao serem utilizados em nomes de branches e commits. Nosso próprio projeto tem um exemplo vivo: o [PR #10](https://github.com/lumamontes/biblioteca-de-zines/pull/10) tem um aviso do GitHub: `The head ref may contain hidden characters: "3-remover-arquivos-n\u00E3o-usados"`.
  
## Justificativa

Manter parte em português e parte em inglês resulta em uma clara separação entre a importância de convenções e o acesso ao projeto. Deste modo, o código consegue se manter organizado e escrito de forma coerente — afinal, todas as funcionalidades da linguagem são em inglês — sem retirar a possibilidade de desenvolvedores brasileiros de participarem do projeto — a documentação é toda em português.

## Consequências

- **Prós**
  - Acesso a não anglófonos
  - Mitigação de bugs de git e GitHub
  - Facilidade da adição de documentação por quem não é técnico
- **Contras**
  - Mudança de contexto entre inglês e português
  - Inglês ainda é necessário para entender o código