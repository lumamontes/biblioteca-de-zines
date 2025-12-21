# Páginas de Autores

## Contexto

Atualmente, os autores são apenas mencionados nas páginas de zines, mas não há uma página dedicada para cada autor onde os usuários possam ver todas as informações do autor e todos os seus zines. Isso limita a descoberta de conteúdo e a navegação do site.

## Decisão

Criar páginas dedicadas para cada autor em `/authors/[slug]` que exibam:
- Informações do autor (nome, biografia, URL)
- Grid com todos os zines publicados do autor (sem paginação, mostrando todos de uma vez)

### Estratégia de Slugs

- Adicionar coluna `slug` na tabela `authors`
- Gerar slugs automaticamente a partir do nome do autor usando a função `slugify`
- Slugs devem ser únicos (constraint UNIQUE)
- Criar trigger ou função para auto-gerar slugs em inserções/atualizações se não fornecidos
- Migração para backfill de slugs existentes

## Alternativas Consideradas

- **Opção 1:** Usar ID numérico na URL (`/authors/[id]`)
  - **Prós:** Mais simples, não requer geração de slugs
  - **Contras:** URLs menos amigáveis, não SEO-friendly

- **Opção 2:** Usar slug baseado no nome (escolhida)
  - **Prós:** URLs amigáveis, melhor para SEO, mais fácil de compartilhar
  - **Contras:** Requer gerenciamento de slugs únicos, migração de dados existentes

- **Opção 3:** Usar nome diretamente na URL
  - **Prós:** Mais simples que slugs
  - **Contras:** Problemas com caracteres especiais, espaços, acentos, não é padrão web

## Justificativa

Slugs baseados em nomes são o padrão da indústria para URLs amigáveis. Eles melhoram a experiência do usuário, são melhores para SEO e facilitam o compartilhamento de links.

A decisão de mostrar todos os zines sem paginação na página do autor foi tomada porque:
- Autores geralmente não têm centenas de zines
- Simplifica a implementação
- Melhor experiência para descobrir todo o trabalho de um autor

## Consequências

- **Prós**
  - Melhor descoberta de conteúdo
  - URLs amigáveis e SEO-friendly
  - Centraliza informações do autor
  - Facilita navegação entre zines do mesmo autor

- **Contras**
  - Requer migração de dados existentes
  - Se um autor tiver muitos zines (100+), pode precisar de paginação no futuro
  - Necessário gerenciar slugs únicos (resolver duplicatas)

## Links

- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Supabase Migrations](https://supabase.com/docs/guides/database/migrations)

