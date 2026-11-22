import { spawnSync } from 'node:child_process';

const query = `
begin read only;
select coalesce(jsonb_agg(to_jsonb(t) order by slug, surface), '[]'::jsonb)
from (
  select z.slug, c.surface,
    coalesce(sum(c.total) filter (where c.event = 'ready'), 0)::text as ready,
    coalesce(sum(c.total) filter (where c.event = 'page-error'), 0)::text as "page-error",
    coalesce(sum(c.total) filter (where c.event = 'fallback'), 0)::text as fallback
  from reader_metrics.daily_counts c
  join public.library_zines z on z.id = c.zine_id
  where c.day between :'from_day'::date and :'to_day'::date
  group by z.slug, c.surface
) t;
commit;
`;

function validDay(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? '')
    && Number.isFinite(Date.parse(value))
    && new Date(value).toISOString().slice(0, 10) === value
    && !value.startsWith('0000-');
}

const [from, to, format = 'json', ...extra] = process.argv.slice(2);
if (!validDay(from) || !validDay(to) || from > to || !['json', 'markdown'].includes(format) || extra.length) {
  console.error('Uso: pnpm reader:events-report AAAA-MM-DD AAAA-MM-DD [json|markdown]');
  process.exit(2);
}

const result = spawnSync('psql', [
  '-X', '-w', '-qAt', '-v', 'ON_ERROR_STOP=1', '-v', `from_day=${from}`, '-v', `to_day=${to}`,
], { input: query, encoding: 'utf8' });
if (result.status !== 0) {
  const message = result.error?.code === 'ENOENT'
    ? 'Instale o cliente PostgreSQL psql.'
    : 'Não foi possível consultar os contadores. Confira a conexão PostgreSQL e as permissões de leitura.';
  console.error(message);
  process.exit(1);
}

const rows = JSON.parse(result.stdout);
if (format === 'json') {
  console.log(JSON.stringify({ from, to, timezone: 'UTC', rows }, null, 2));
} else {
  console.log(`# Contagem de eventos do leitor\n\nPeríodo de ${from} a ${to} (UTC, inclusive).\n`);
  if (!rows.length) {
    console.log('Nenhuma ocorrência no período.');
  } else {
    console.log('| Zine | Superfície | Aberturas | Falhas | Ofertas de PDF |');
    console.log('| --- | --- | ---: | ---: | ---: |');
    for (const row of rows) {
      const slug = row.slug.replace(/[\r\n]/g, ' ').replace(/[&<>|`*_[\]\\]/g, (char) => `&#${char.charCodeAt(0)};`);
      console.log(`| ${slug} | ${row.surface} | ${row.ready} | ${row['page-error']} | ${row.fallback} |`);
    }
  }
}
