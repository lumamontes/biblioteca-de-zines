# Paginação na Listagem de Zines

## Contexto

A página de listagem de zines atualmente carrega mais de 100 zines de uma vez, o que resulta em uma experiência ruim para o usuário. O carregamento inicial é lento e a navegação pela página se torna difícil com tantos itens.

## Decisão

Implementar paginação no lado do cliente com suporte a 20, 50 ou 100 itens por
página. A paginação funcionará com os filtros existentes, começará com 20 itens,
resetará para a página 1 quando os filtros mudarem e manterá `page` e `limit` na
URL.

## Alternativas Consideradas

- **Opção 1:** Paginação apenas no servidor
  - **Prós:** Menos dados transferidos, melhor performance
  - **Contras:** Requer refetch a cada mudança de página, mais complexo com filtros client-side existentes

- **Opção 2:** Paginação apenas no cliente (escolhida)
  - **Prós:** Mantém a arquitetura atual de filtros client-side, experiência mais fluida, não requer mudanças no backend
  - **Contras:** Todos os dados são carregados inicialmente (mas já é assim atualmente)

- **Opção 3:** Infinite scroll
  - **Prós:** Experiência moderna, sem necessidade de clicar em páginas
  - **Contras:** Mais complexo de implementar, pode ser confuso para alguns usuários, dificulta navegação direta para uma página específica

## Justificativa

A escolha pela paginação client-side se alinha com a arquitetura atual onde os filtros são aplicados no cliente após buscar todos os zines publicados. Isso mantém a consistência e evita refatoração significativa do código existente.

A seleção de quantidade permite que usuários escolham quantos itens querem ver por página, melhorando a flexibilidade da interface.

O reset para página 1 quando filtros mudam garante que o usuário sempre veja resultados relevantes e não fique em uma página vazia ou com poucos resultados.

## Consequências

- **Prós**
  - Melhor experiência do usuário com carregamento mais rápido da página inicial (apenas 20 zines)
  - Navegação mais fácil através dos resultados
  - Flexibilidade na quantidade de itens por página
  - Estado na URL permite compartilhamento de links específicos
  - Mantém a arquitetura atual de filtros
  - Carregamento inteligente: só busca mais dados quando necessário (filtros aplicados ou navegação para páginas que requerem mais dados)

- **Contras**
  - Quando filtros são aplicados ou usuário navega para páginas além dos dados iniciais, todos os zines são buscados (mas isso é necessário para filtros funcionarem corretamente)
  - Se o número de zines crescer muito (1000+), pode ser necessário migrar para paginação server-side no futuro

## Links

- [Next.js URL Search Params](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [Supabase Pagination](https://supabase.com/docs/guides/database/pagination)
