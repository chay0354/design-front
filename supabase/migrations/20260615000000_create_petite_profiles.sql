-- Petite Dreams user profiles (purchases + children)
create table if not exists public.petite_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  purchased_packages text[] not null default '{}',
  children jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.petite_profiles enable row level security;

drop policy if exists "petite_profiles_select_own" on public.petite_profiles;
drop policy if exists "petite_profiles_insert_own" on public.petite_profiles;
drop policy if exists "petite_profiles_update_own" on public.petite_profiles;

create policy "petite_profiles_select_own"
  on public.petite_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "petite_profiles_insert_own"
  on public.petite_profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "petite_profiles_update_own"
  on public.petite_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_petite_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.petite_profiles (id, email, name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(split_part(new.email, '@', 1), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_petite on auth.users;

create trigger on_auth_user_created_petite
  after insert on auth.users
  for each row execute function public.handle_new_petite_user();

grant select, insert, update on public.petite_profiles to authenticated;
