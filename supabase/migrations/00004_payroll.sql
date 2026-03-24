create table public.employees (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid references public.organizations(id),
  full_name       text not null,
  role            text,
  bank_account    text,
  bank_name       text,
  salary_ngn      numeric(15,2) not null default 0,
  active          boolean not null default true,
  created_at      timestamptz default now()
);

create table public.payroll_runs (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid references public.organizations(id),
  period_start    date not null,
  period_end      date not null,
  status          text not null default 'pending' check (status in ('pending','processed','failed')),
  total           numeric(15,2) not null default 0,
  created_at      timestamptz default now()
);

create table public.payroll_entries (
  id              uuid primary key default gen_random_uuid(),
  run_id          uuid references public.payroll_runs(id) on delete cascade,
  employee_id     uuid references public.employees(id),
  gross           numeric(15,2) not null,
  deductions      numeric(15,2) not null default 0,
  net             numeric(15,2) generated always as (gross - deductions) stored,
  created_at      timestamptz default now()
);
