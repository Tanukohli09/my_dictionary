-- My Dictionary cloud data schema
-- Run this once in the Supabase SQL editor before enabling cloud sync.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.word_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  word text not null,
  normalized_word text not null,
  first_letter text not null,
  phonetic text,
  audio_url text,
  part_of_speech text,
  meaning_short text not null,
  definitions jsonb not null default '[]'::jsonb,
  example text,
  examples jsonb not null default '[]'::jsonb,
  synonyms jsonb not null default '[]'::jsonb,
  antonyms jsonb not null default '[]'::jsonb,
  my_meaning text,
  personal_note text,
  is_favorite boolean not null default false,
  search_count integer not null default 0 check (search_count >= 0),
  reviewed_count integer not null default 0 check (reviewed_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  mastery_level integer not null default 0 check (mastery_level between 0 and 5),
  source text not null default 'cloud',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_searched_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, id),
  unique (user_id, normalized_word)
);

create table if not exists public.review_submissions (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  session_id text not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  total_questions integer not null check (total_questions >= 0),
  correct_answers integer not null check (correct_answers >= 0),
  reviewed_words jsonb not null default '[]'::jsonb,
  questions jsonb not null default '[]'::jsonb,
  primary key (user_id, id)
);

create index if not exists word_entries_user_updated_idx
  on public.word_entries (user_id, updated_at desc);
create index if not exists review_submissions_user_completed_idx
  on public.review_submissions (user_id, completed_at desc);

-- Keep future public objects unexposed by default. Grant the required access
-- explicitly below for each table used by the signed-in app.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from public;

alter table public.profiles enable row level security;
alter table public.word_entries enable row level security;
alter table public.review_submissions enable row level security;

-- The project disables automatic Data API grants. Expose only these tables
-- to authenticated clients; row policies below restrict each account.
revoke all on table public.profiles, public.word_entries, public.review_submissions from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.word_entries, public.review_submissions to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can read their own word entries" on public.word_entries;
create policy "Users can read their own word entries"
  on public.word_entries for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own word entries" on public.word_entries;
create policy "Users can create their own word entries"
  on public.word_entries for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own word entries" on public.word_entries;
create policy "Users can update their own word entries"
  on public.word_entries for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own word entries" on public.word_entries;
create policy "Users can delete their own word entries"
  on public.word_entries for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own review submissions" on public.review_submissions;
create policy "Users can read their own review submissions"
  on public.review_submissions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own review submissions" on public.review_submissions;
create policy "Users can create their own review submissions"
  on public.review_submissions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own review submissions" on public.review_submissions;
create policy "Users can update their own review submissions"
  on public.review_submissions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own review submissions" on public.review_submissions;
create policy "Users can delete their own review submissions"
  on public.review_submissions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create schema if not exists app_private;
revoke all on schema app_private from public;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    email = excluded.email,
    updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function app_private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure app_private.handle_new_user();

-- Clean up a previous version if the schema was applied before this revision.
drop function if exists public.handle_new_user();

-- When Supabase's automatic-RLS option is enabled, its event-trigger helper
-- should not be executable through the public Data API.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke all on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
