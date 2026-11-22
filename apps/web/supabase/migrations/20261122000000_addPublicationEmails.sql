create table public.publication_emails (
  zine_id bigint not null references public.library_zines(id) on delete cascade,
  author_id bigint not null references public.authors(id) on delete cascade,
  recipient text not null,
  reserved_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_id text,
  primary key (zine_id, author_id),
  check ((sent_at is null) = (provider_id is null))
);

alter table public.publication_emails enable row level security;
revoke all on public.publication_emails from public, anon, authenticated;
grant select, insert, update, delete on public.publication_emails to service_role;
