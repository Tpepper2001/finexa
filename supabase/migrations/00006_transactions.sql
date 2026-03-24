create table public.transactions (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid references public.organizations(id),
  type            text not null default 'other',
  amount          numeric(15,2) not null,
  reference       text,
  description     text,
  direction       text not null default 'credit' check (direction in ('credit','debit')),
  related_id      uuid,   -- generic FK to invoice/payroll_run/receipt
  created_at      timestamptz default now()
);

create index transactions_org_id_idx on public.transactions(org_id);
create index transactions_type_idx   on public.transactions(type);
