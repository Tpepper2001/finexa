create table public.receipts (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid references public.organizations(id),
  storage_path    text,
  amount          numeric(15,2) not null default 0,
  merchant        text,
  category        text,
  date            date not null default current_date,
  notes           text,
  created_at      timestamptz default now()
);

create index receipts_org_id_idx on public.receipts(org_id);
create index receipts_date_idx   on public.receipts(date desc);
