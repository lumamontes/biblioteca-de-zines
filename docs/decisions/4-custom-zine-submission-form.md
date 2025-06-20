# Implementar formulário de criação de zines diretamente no site

## Contexto

A Biblioteca de Zines usa Google Forms para coletar submissões de zines, o que gera transtornos para sincronizar a planilha com o banco de dados no Supabase. É necessário uma solução mais integrada que elimine essa sincronização manual.

## Decisão

Implementar o formulário de criação de zines diretamente no site, substituindo o Google Forms de forma gradual. A planilha ainda pode ser usada para consulta e catalogação.

## Alternativas Consideradas

- **Opção 1:** `Manter Google Forms`
  - **Prós:** Sem desenvolvimento adicional
  - **Contras:** Transtornos de sincronização manual entre planilha e banco de dados
  
- **Opção 2:** `Automatizar sincronização Google Forms`
  - **Prós:** Mantém interface familiar
  - **Contras:** Complexidade de integração, dependência externa não centralizada na nossa base de código

## Justificativa

Eliminar os transtornos de sincronização manual entre Google Forms e banco de dados, mantendo a experiência integrada no site. A integração com Telegram garante notificações.

## Consequências

- **Prós**
  - Elimina sincronização manual entre planilha e banco de dados
  - Experiência integrada no site
  - Notificações automáticas via Telegram
  - Submissões vão direto para o dashboard de administração

- **Contras**
  - Maior responsabilidade de manutenção do formulário
  - Desenvolvimento inicial necessário

## Links

- [Implementação do formulário](../src/app/(main)/zines/apply/)
- [Hooks customizados](../src/hooks/)
- [Componentes do formulário](../src/components/apply-zine/) 