# Como escrever uma ADR

## Antes: o que é um ADR?

Um Registro de Decisão Arquitetural (ADR) é como se fosse um diário das decisões importantes que uma equipe toma sobre a arquitetura de um projeto.

Ele serve pra organizar as ideias, registrar o motivo das escolhas e mostrar as consequências, boas ou ruins, pra que todo mundo fique na mesma página e saiba o que rolou.

Leia mais em nossa [primeira ADR](./1-adr.md)

## Criando o arquivo

Na pasta `docs/decisions`, crie um arquivo com um nome siga a seguinte convenção:

1. Um número que é incrementado da última ADR;
2. Um título que explique em palavras chave o tema da ADR;
3. A extensão `.md`, ou seja, [Markdown](https://www.markdownguide.org/)

- Exemplo: se a última ADR é a `3-testes-e2e-playwright.md`, seu arquivo pode ser `4-tema-da-adr.md`

Nesse arquivo, utilize o template.

## Campos do Template

### 1. **Título do ADR**

- **O que é?** O nome do assunto da decisão.
- **Exemplo:** "Adotar Playwright como ferramenta de testes E2E"

### 2. **Contexto**

- **O que é?** Aqui você explica o cenário, o problema que precisa resolver ou por que a decisão é necessária.
- **Dica:** Fale o essencial, sem enrolar. Não cite a decisão — essa parte é sobre o problema, não a solução.
- **Exemplo:** "Queremos configurar uma suite de testes E2E em nossa aplicação para trazer mais confiança em nossa codebase."

### 3. **Decisão**

- **O que é?** A escolha que foi feita e os detalhes mais importantes dela.
- **Dica:** Seja direto e claro.
- **Exemplo:** "Vamos adotar o Playwright como nossa ferramenta principal para testes E2E porque ele é rápido, confiável e tem boa integração com nosso stack atual."

### 4. **Alternativas Consideradas**

- **O que é?** As outras opções que você pensou antes de tomar a decisão e os prós e contras de cada uma.
- **Dica:** Liste pelo menos uma outra alternativa e explique por que ela não foi escolhida. Não existe decisão sem alternativas.
- **Exemplo:**
  - **Opção 1:** Não usar testes E2E
    - **Prós:** Nenhum esforço inicial
    - **Contras:** Falta de confiança na aplicação e chance de quebrar ao aplicar mudanças em produção.
  - **Opção 2:** Usar Cypress
    - **Prós:** Fácil de usar, boa documentação
    - **Contras:** Membros do time já relataram problemas com a plataforma

### 5. **Justificativa**

- **O que é?** Por que essa foi a melhor escolha? Baseie-se nos dados e no contexto.
- **Dica:** Mostre que a decisão faz sentido.
- **Exemplo:** "O Playwright tem melhor suporte para múltiplos navegadores, é mais rápido nos testes e se encaixa melhor nas nossas necessidades específicas."

### 6. **Consequências**

- **O que é?** O que vai acontecer por causa dessa decisão? Inclua os pontos positivos e os desafios.
- **Dica:** Seja realista, mostre os dois lados.
- **Exemplo:** "Positivo: Testes mais rápidos e confiáveis. Negativo: Curva de aprendizado inicial para a equipe."

### 7. **Links**

- **O que é?** Referências pra ajudar a entender melhor ou aprofundar.
- **Exemplo:** "[Documentação do Playwright](https://playwright.dev/)"

## Como Usar o Template

1. Copie o template que está em `0-template.md`.
2. Preencha as seções com as informações do que você decidiu.
3. Salve o ADR no repositório do projeto pra que todo mundo tenha acesso.
4. Atualize os ADRs sempre que a decisão mudar ou evoluir.

## E se mudanças deixarem alguma ADR obsoleta?

1. Crie a nova ADR e adicione o seguinte termo sob o título: `**Substitui [1-link-da-adr-velha](./1-link-da-adr-velha.md)**`
2. Na ADR substituida, adicione a linha, sob o título: `**Substituída por [1-link-da-adr-nova](./1-link-da-adr-nova.md)**`

Exemplo 1:

```md
# Título do ADR

**Substitui [1-link-da-adr-velha](./1-link-da-adr-velha.md)**
```

Exemplo 2:

```md
# Título do ADR

**Substituída por [1-link-da-adr-nova](./1-link-da-adr-nova.md)**
```

## Boas Práticas

- Escreva o ADR logo depois de tomar a decisão, enquanto tudo ainda está fresco na cabeça.
- Mantenha o texto direto e fácil de entender.
- Compartilhe com a equipe e peça feedback, assim as decisões ficam mais sólidas.

## Leituras recomendadas

- [Y-Statements](https://medium.com/olzzio/y-statements-10eb07b5a177)
- [ADRs no Github](https://adr.github.io/)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
