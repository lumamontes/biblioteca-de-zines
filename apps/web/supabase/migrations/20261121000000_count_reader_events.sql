create schema if not exists reader_metrics;
revoke all on schema reader_metrics from public, anon, authenticated;
grant usage on schema reader_metrics to service_role;

create table reader_metrics.daily_counts (
  day date not null,
  zine_id integer not null references public.library_zines(id) on delete cascade,
  surface text not null check (surface in ('standalone', 'embed')),
  event text not null check (event in ('ready', 'page-error', 'fallback')),
  total bigint not null default 1,
  primary key (day, zine_id, surface, event)
);
alter table reader_metrics.daily_counts enable row level security;
revoke all on reader_metrics.daily_counts from public, anon, authenticated;
grant select, insert, update on reader_metrics.daily_counts to service_role;

create function public.count_reader_event(p_slug text, p_surface text, p_event text)
returns void language sql security invoker set search_path = '' as $$
  insert into reader_metrics.daily_counts as counts (day, zine_id, surface, event)
  select (now() at time zone 'UTC')::date, id, p_surface, p_event
  from public.library_zines where slug = p_slug and is_published
  on conflict (day, zine_id, surface, event)
  do update set total = counts.total + 1;
$$;
revoke all on function public.count_reader_event(text,text,text) from public, anon, authenticated;
grant execute on function public.count_reader_event(text,text,text) to service_role;
