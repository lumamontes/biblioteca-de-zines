# Paginação na Listagem de Zines

## Contexto

A página de listagem de zines atualmente carrega mais de 100 zines de uma vez, o que resulta em uma experiência ruim para o usuário. O carregamento inicial é lento e a navegação pela página se torna difícil com tantos itens.

## Decisão

Implementar paginação no lado do cliente com suporte a seleção de quantidade de itens por página. A paginação funcionará em conjunto com os filtros existentes (busca, categorias, anos) e resetará para a página 1 sempre que os filtros mudarem.

### Detalhes da Implementação

- **Quantidade padrão**: 20 itens por página
- **Opções de quantidade**: 20, 50, 100 itens
- **Integração com filtros**: A paginação funciona junto com os filtros existentes
- **Reset automático**: Quando qualquer filtro muda, a página volta para 1
- **Estado na URL**: Os parâmetros `page` e `limit` são mantidos na URL para compartilhamento e navegação do navegador

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

## Detalhes de Implementação

### Carregamento Inicial
- Apenas 20 zines são carregados do servidor na página inicial
- Se a URL contém parâmetros de página que requerem mais dados, o loading é exibido imediatamente
- Se não há filtros ativos, os 20 zines iniciais são exibidos sem busca adicional

### Busca Inteligente
- A busca (`searchZines()`) só é acionada quando:
  - Filtros são aplicados (busca, categorias, anos, ordenação)
  - Usuário navega para uma página que requer mais dados do que os disponíveis
- Mudanças apenas de página/quantidade que não requerem mais dados não disparam busca adicional

### Estado de Loading
- Loading é exibido imediatamente quando necessário (antes da busca começar)
- Skeleton é mostrado quando não há dados suficientes para a página atual
- Evita "flash" de conteúdo incorreto durante navegação

## Links

- [Next.js URL Search Params](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [Supabase Pagination](https://supabase.com/docs/guides/database/pagination)

