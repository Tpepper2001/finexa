create table public.teller_sessions (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid references public.organizations(id),
  operator_id     uuid references public.profiles(id),
  opened_at       timestamptz default now(),
  closed_at       timestamptz,
  notes           text
);

create table public.teller_entries (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid references public.teller_sessions(id),
  amount          numeric(15,2) not null,
  direction       text not null default 'credit' check (direction in ('credit','debit')),
  note            text,
  created_at      timestamptz default now()
);

create index teller_entries_session_idx on public.teller_entries(session_id);
