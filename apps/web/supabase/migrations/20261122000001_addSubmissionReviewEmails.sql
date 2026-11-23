create table public.submission_review_emails (
  upload_id bigint primary key references public.form_uploads(id) on delete cascade,
  recipient text not null,
  reserved_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_id text,
  check ((sent_at is null) = (provider_id is null))
);

alter table public.submission_review_emails enable row level security;
revoke all on public.submission_review_emails from public, anon, authenticated;
grant select, insert, update, delete on public.submission_review_emails to service_role;
