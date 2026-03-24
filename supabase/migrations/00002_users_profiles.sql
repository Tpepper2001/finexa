create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  logo_url    text,
  currency    text not null default 'NGN',
  created_at  timestamptz default now()
);

create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  org_id      uuid references public.organizations(id),
  full_name   text,
  role        text default 'member',
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
