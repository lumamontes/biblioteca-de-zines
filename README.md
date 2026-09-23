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

Você precisa de um arquivo `.env` na raiz do projeto com todas as variáveis necessárias — use como base o arquivo `.env-example`. Se você não tem acesso a essas variáveis, entre em contato com nosso time através do [nosso email](mailto:bibliotecadezines@gmail.com).

Para rodar o servidor de desenvolvimento, digite no terminal: 

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) com seu browser para ver o site funcionando.

## Mantenedores

[![Avatar de lumamontes](https://github.com/lumamontes.png?size=50)](https://github.com/angelod1as)
[![Avatar de angelod1as](https://github.com/angelod1as.png?size=50)](https://github.com/angelod1as)
