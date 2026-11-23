alter table public.publication_emails
  add column id bigint generated always as identity,
  add column template text not null default 'published',
  add column upload_id bigint references public.form_uploads(id) on delete cascade,
  add column from_address text,
  add column reply_to text,
  add column subject text,
  add column body text,
  drop constraint publication_emails_pkey,
  alter column zine_id drop not null,
  alter column author_id drop not null,
  add primary key (id),
  add constraint publication_emails_template_target_check check (
    (template = 'published' and zine_id is not null and author_id is not null and upload_id is null)
    or (template = 'invalid-link' and upload_id is not null and zine_id is null and author_id is null)
  ),
  add constraint publication_emails_snapshot_check check (
    num_nonnulls(from_address, reply_to, subject, body) in (0, 4)
  );

create unique index publication_emails_published_unique
  on public.publication_emails (zine_id, author_id) where template = 'published';

create unique index publication_emails_invalid_link_unique
  on public.publication_emails (upload_id) where template = 'invalid-link';

lock table public.submission_review_emails in access exclusive mode;

insert into public.publication_emails (template, upload_id, recipient, reserved_at, sent_at, provider_id)
select 'invalid-link', upload_id, recipient, reserved_at, sent_at, provider_id
from public.submission_review_emails;

drop table public.submission_review_emails;
