create table public.invoices (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid references public.organizations(id),
  client_name   text not null,
  client_email  text,
  status        text not null default 'draft' check (status in ('draft','sent','paid','overdue')),
  due_date      date,
  total_ngn     numeric(15,2) not null default 0,
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table public.invoice_items (
  id            uuid primary key default gen_random_uuid(),
  invoice_id    uuid references public.invoices(id) on delete cascade,
  description   text not null,
  qty           numeric(10,2) not null default 1,
  unit_price    numeric(15,2) not null default 0,
  total         numeric(15,2) generated always as (qty * unit_price) stored
);

create index invoices_org_id_idx on public.invoices(org_id);
create index invoices_status_idx  on public.invoices(status);
