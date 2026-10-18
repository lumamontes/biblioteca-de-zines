# Biblioteca de Zines

![ScreenRecording2025-01-12at20 47 59-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/66998486-ce02-4af1-aab7-fb2bb28ce066)

## For English-speaking readers

_Biblioteca de Zines (Zine Library) is an open-source collaborative collection of digital zines and independent publications, focused on Brazilian production. The website is built using Next.js._

_If you want to know more, use your browser's translate function — as everyone in South America once did if they didn't understand something in English. Do your jumps._

## Sobre

A Biblioteca de Zines é um site que tem como ambição reunir uma vasta coleção digital de zines e publicações independentes.

O catálogo é focado em publicações brasileiras. O projeto é open-source e colaborativo.

## Documentação

Esse é um projeto criado através do [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Nossa stack é:

- [Next.js](https://nextjs.org)
- [Tailwind](https://tailwindcss.com/)

### Monitoramento dos PDFs

O workflow `.github/workflows/resource-monitor.yml` consulta os zines publicados
na tabela `library_zines` do Supabase e verifica anonimamente os PDFs publicados. O workflow usa os secrets existentes
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. A chave anon só funciona se
as políticas RLS permitirem a leitura dos campos públicos de `library_zines`; o
exportador não grava credenciais nem a coleção no repositório.

O workflow pode ser executado semanalmente ou manualmente em **Actions**. Cada
execução publica os relatórios JSON e Markdown como artefatos, mesmo quando o
monitor encontra recursos que precisam de atenção. Para reproduzir localmente,
execute `node scripts/export-monitor-resources.mjs resources.json` com as duas
variáveis de ambiente e depois rode o CLI conforme documentado no repositório do
monitor.

### Inventário local do acervo

O inventário é uma observação local e não modifica o acervo, o Supabase ou as
fontes externas. Ele consulta somente leitura as tabelas centrais, calcula
evidências dos arquivos locais e grava snapshots e relatórios fora do repositório
por padrão.

```bash
pnpm archive:inventory --archive /caminho/para/archive \
  --known-failures /caminho/para/known-failures.json \
  --output /caminho/fora-do-repositorio/inventory-run
```

O arquivo de falhas conhecidas deve ser um JSON local com `version` e uma lista
`failures`, cada uma com `cause` estruturada. Os resultados são
`supabase-snapshot.json`, `manifest.json` e `report.md`; uma comparação adicional
é gravada quando `--previous` aponta para um manifesto anterior.

Não use `--allow-repository-output` para dados reais do acervo. A lista de
falhas conhecidas é histórica: o inventário não repete downloads ou verificações
de rede para esses registros.

### Para contribuir com o projeto

- Entenda nosso [Código de Conduta](CODE_OF_CONDUCT.md)
- Leia o arquivo [Como contribuir](CONTRIBUTING.md)
- Entenda nossa [Licença](LICENSE.md) open-source

### Como rodar

O projeto é um monorepo com duas aplicações: o site e seus workers ficam em
`apps/web`, enquanto o viewer isolado fica em `apps/viewer`.

As variáveis de ambiente são separadas por aplicação. Para configurar o site e
os workers, use `apps/web/.env.local` como base no arquivo
`apps/web/env.example`. Para o viewer, use `apps/viewer/.env.local` como base
em `apps/viewer/env.example`. O viewer deve receber somente as variáveis de
que precisa para funcionar; não copie secrets do web para uma instalação de
produção do viewer.

Se você não tem acesso às variáveis necessárias, entre em contato com nosso
time através do [nosso email](mailto:bibliotecadezines@gmail.com).

Para rodar o site e o viewer juntos, digite no terminal:

```bash
pnpm dev:all
```

Abra [http://localhost:3000](http://localhost:3000) para ver o site e
[http://localhost:4100](http://localhost:4100) para testar o viewer isolado.

Se quiser rodar somente o site, use:

```bash
pnpm dev
```

Os workers e scripts de processamento são executados a partir de `apps/web`,
por exemplo:

```bash
pnpm process:pending-zines
pnpm migrate:pdf-covers
```

## Mantenedores

[![Avatar de lumamontes](https://github.com/lumamontes.png?size=50)](https://github.com/angelod1as)
[![Avatar de angelod1as](https://github.com/angelod1as.png?size=50)](https://github.com/angelod1as)
