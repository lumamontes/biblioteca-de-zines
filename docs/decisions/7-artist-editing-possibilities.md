# Possibilidades de Edição de Informações por Artistas

## Contexto

Atualmente, o sistema não possui um sistema de login. Os artistas podem apenas submeter zines através de um formulário que coleta informações de contato (nome, email, URL). Não há uma forma para que os artistas editem suas próprias informações (biografia, URL, etc.) ou gerenciem seus zines publicados após a submissão.

## Decisão

Este documento explora possibilidades e ideias para permitir que artistas editem suas informações sem implementar um sistema de login tradicional. Nenhuma implementação específica foi escolhida ainda - este é um documento exploratório.

## Estado Atual

- Formulário de submissão coleta: nome do autor, email, URL
- Autores são criados automaticamente quando uma zine é publicada
- Não há autenticação ou autorização
- Administradores gerenciam tudo através do dashboard

## Alternativas Consideradas

### Opção 1: Magic Links (Email-based Authentication)
**Como funciona:**
- Artista solicita edição através de um link "Editar meu perfil"
- Sistema envia email com link único e temporário
- Link contém token criptografado que expira após X horas
- Artista clica no link e pode editar suas informações

**Prós:**
- Sem necessidade de senhas
- Seguro (tokens expiram)
- Familiar para usuários (padrão comum)
- Pode usar email já coletado no formulário

**Contras:**
- Requer sistema de envio de emails
- Tokens podem ser compartilhados acidentalmente
- Depende de acesso ao email
- Mais complexo de implementar

**Complexidade:** Média-Alta

### Opção 2: Token de Edição Único (One-time Edit Links)
**Como funciona:**
- Quando uma zine é publicada, sistema gera token único
- Token é enviado por email ao artista
- Artista pode usar token para editar informações uma vez
- Token expira após uso ou após X dias

**Prós:**
- Muito simples de implementar
- Seguro (one-time use)
- Não requer sistema de autenticação completo

**Contras:**
- Limitado a uma edição por token
- Artista precisa solicitar novo token para cada edição
- Menos flexível

**Complexidade:** Baixa-Média

### Opção 3: Links Permanentes com Verificação de Email
**Como funciona:**
- Cada autor recebe um "link de edição" único e permanente
- Link é enviado por email quando autor é criado
- Ao acessar link, sistema verifica email antes de permitir edição
- Pode usar código de verificação enviado por email

**Prós:**
- Acesso permanente sem precisar de novo token
- Verificação de email adiciona camada de segurança
- Relativamente simples

**Contras:**
- Links podem ser compartilhados (menos seguro)
- Requer verificação de email a cada acesso
- Pode ser confuso para usuários

**Complexidade:** Média

### Opção 4: Sistema de "Claim" de Perfil
**Como funciona:**
- Artista pode "reivindicar" seu perfil através de verificação de email
- Após verificação, recebe link permanente de edição
- Sistema associa email ao autor
- Pode editar informações e gerenciar zines

**Prós:**
- Permite associação permanente de email ao autor
- Mais controle para o artista
- Pode evoluir para sistema mais completo no futuro

**Contras:**
- Mais complexo de implementar
- Requer gerenciamento de estado de "claimed"
- Precisa de interface de "claim"

**Complexidade:** Alta

### Opção 5: Edição via Email (Email-based Editing)
**Como funciona:**
- Artista envia email com formato específico
- Sistema processa email e atualiza informações
- Pode usar comandos simples no corpo do email

**Prós:**
- Muito simples para o artista
- Não requer interface web
- Familiar (como comandos de email)

**Contras:**
- Menos seguro (qualquer um com acesso ao email pode editar)
- Difícil de validar
- Pode ser confuso
- Requer processamento de emails

**Complexidade:** Alta

## Recomendações

### Curto Prazo (MVP)
**Opção 2: Token de Edição Único** parece ser a melhor escolha para um MVP:
- Implementação relativamente simples
- Seguro o suficiente
- Permite validar a necessidade antes de investir em solução mais complexa
- Pode evoluir para outras opções no futuro

### Médio Prazo
**Opção 1: Magic Links** seria uma evolução natural:
- Melhor experiência do usuário
- Padrão da indústria
- Permite múltiplas edições sem gerar novos tokens

### Longo Prazo
**Opção 4: Sistema de Claim** permitiria:
- Autores terem mais controle
- Possibilidade de adicionar mais funcionalidades (notificações, estatísticas)
- Base para sistema mais completo

## Considerações de Segurança

- **Validação de Email:** Qualquer solução deve verificar que o usuário tem acesso ao email associado
- **Expiração de Tokens:** Tokens devem expirar após período razoável
- **Rate Limiting:** Limitar número de tentativas de edição
- **Audit Log:** Registrar todas as edições para rastreabilidade
- **Validação de Dados:** Validar todas as entradas antes de salvar

## Considerações de Implementação

### Componentes Necessários
1. **Sistema de Email:**
   - Serviço de envio (SendGrid, Resend, etc.)
   - Templates de email
   - Queue para processamento

2. **Gerenciamento de Tokens:**
   - Geração de tokens seguros
   - Armazenamento temporário (Redis ou tabela no banco)
   - Validação e expiração

3. **Interface de Edição:**
   - Formulário de edição
   - Validação de permissões
   - Feedback ao usuário

4. **Banco de Dados:**
   - Tabela para tokens (se necessário)
   - Campos de auditoria (updated_by, updated_at)
   - Possível campo "claimed_by_email" na tabela authors

## Próximos Passos Sugeridos

1. **Validar Necessidade:**
   - Pesquisar com artistas se há demanda real
   - Quantificar quantas solicitações de edição são recebidas

2. **Protótipo:**
   - Implementar Opção 2 (Token Único) como MVP
   - Testar com grupo pequeno de artistas

3. **Iterar:**
   - Coletar feedback
   - Avaliar se precisa evoluir para solução mais complexa

## Links

- [Magic Link Authentication](https://www.okta.com/identity-101/magic-links/)
- [Supabase Auth](https://supabase.com/docs/guides/auth) (para referência, caso queira evoluir)
- [Email Verification Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

