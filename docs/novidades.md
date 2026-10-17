# Novidades da Biblioteca

## Organização

As novidades são mantidas como arquivos versionados no repositório, não em um
CMS ou banco de dados.

`/novidades` é a visão pública. Ela explica mudanças do site e marcos da
Biblioteca em linguagem acessível.

`/novidades?view=nerds` é a visão técnica. Ela lista mudanças relevantes com a
categoria em pt-BR e links para os PRs relacionados.

Publicações sobre eventos, oficinas, apresentações, retrospectivas e outras
atividades da Biblioteca também aparecem na visão pública. Textos do Substack
continuam em `/publicacoes`.

## Datas

- Notícias e marcos podem ter uma data do acontecimento e uma data editorial.
- Novidades usam a data em que a atualização foi publicada.
- A visão técnica usa a data em que a mudança foi incorporada à `main`, que é o
  marco de publicação em produção. Mudanças ainda não incorporadas aparecem em
  `Não publicado`.

## Contribuições

Todo PR deve usar o template em `.github/pull_request_template.md`. Mudanças
com impacto perceptível para pessoas usuárias devem incluir uma entrada pública
em `/novidades`; mudanças internas podem aparecer apenas na visão técnica.

### Escrevendo uma entrada técnica

O changelog é para pessoas, não para o histórico de commits. Uma entrada deve:

- descrever a mudança observável, não repetir o título de um commit;
- explicar o problema resolvido ou por que a mudança importa;
- dizer o que acontece no fluxo normal e, quando relevante, em falhas,
  migrações, compatibilidade ou limites;
- agrupar commits que pertencem à mesma issue ou unidade de trabalho;
- usar uma categoria do Keep a Changelog e uma referência verificável;
- ter um título específico e um resumo em frases completas, nunca uma lista de
  termos técnicos.

Antes de abrir o PR, rode `pnpm test:changelog`. A validação rejeita entradas
sem referência, curtas demais, sem frase completa ou com formato de lista de
palavras.

Quando uma publicação vier do Instagram ou de outra plataforma, preserve a URL
original e os créditos disponíveis. Uma publicação pública em outra plataforma
não deve ser tratada como prova automática de autorização para qualquer novo
uso.
