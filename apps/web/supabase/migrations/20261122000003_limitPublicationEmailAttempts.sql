alter table public.publication_emails
  add column attempt_key uuid unique,
  add column rejection text,
  add constraint publication_emails_rejection_check check (
    rejection is null or (
      rejection in ('recipient', 'configuration', 'rate-limit')
      and sent_at is null and attempt_key is not null
    )
  );

drop index public.publication_emails_published_unique;
drop index public.publication_emails_invalid_link_unique;

create unique index publication_emails_published_unique
  on public.publication_emails (zine_id, author_id)
  where template = 'published' and rejection is null;

create unique index publication_emails_invalid_link_unique
  on public.publication_emails (upload_id)
  where template = 'invalid-link' and rejection is null;

create index publication_emails_reserved_at_idx on public.publication_emails (reserved_at);

create function public.limit_publication_email_attempts()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  attempt_time timestamptz;
  recent_count bigint;
  daily_count bigint;
  recipient_count bigint;
  target_count bigint;
begin
  if new.attempt_key is null then
    raise exception using errcode = 'PBD02', message = 'A current confirmation is required';
  end if;

  -- Serialize admissions so two concurrent requests cannot spend the last slot.
  perform pg_advisory_xact_lock(536821, 215);
  attempt_time := clock_timestamp();
  new.reserved_at := attempt_time;

  select
    count(*) filter (where reserved_at > attempt_time - interval '10 minutes'),
    count(*),
    count(*) filter (where lower(recipient) = lower(new.recipient)),
    count(*) filter (where template = new.template
      and zine_id is not distinct from new.zine_id
      and author_id is not distinct from new.author_id
      and upload_id is not distinct from new.upload_id)
  into recent_count, daily_count, recipient_count, target_count
  from public.publication_emails
  where reserved_at > attempt_time - interval '24 hours';

  if recent_count >= 5 or daily_count >= 20 or recipient_count >= 3 or target_count >= 3 then
    raise exception using errcode = 'PBD01', message = 'Publication email limit reached';
  end if;
  return new;
end;
$$;

revoke all on function public.limit_publication_email_attempts() from public, anon, authenticated;
create trigger limit_publication_email_attempts
  before insert on public.publication_emails
  for each row execute function public.limit_publication_email_attempts();
