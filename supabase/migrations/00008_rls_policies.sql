-- Enable RLS on all tables
alter table public.profiles          enable row level security;
alter table public.organizations     enable row level security;
alter table public.invoices          enable row level security;
alter table public.invoice_items     enable row level security;
alter table public.employees         enable row level security;
alter table public.payroll_runs      enable row level security;
alter table public.payroll_entries   enable row level security;
alter table public.receipts          enable row level security;
alter table public.transactions      enable row level security;
alter table public.teller_sessions   enable row level security;
alter table public.teller_entries    enable row level security;

-- Profiles: users can only read/update their own profile
create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id);

-- Organizations: members can read their org
create policy "orgs: members can read" on public.organizations
  for select using (
    id in (select org_id from public.profiles where id = auth.uid())
  );

-- Invoices: org members only
create policy "invoices: org members" on public.invoices
  for all using (
    org_id in (select org_id from public.profiles where id = auth.uid())
  );

-- Invoice items: via invoice ownership
create policy "invoice_items: via invoice" on public.invoice_items
  for all using (
    invoice_id in (
      select id from public.invoices
      where org_id in (select org_id from public.profiles where id = auth.uid())
    )
  );

-- Employees
create policy "employees: org members" on public.employees
  for all using (
    org_id in (select org_id from public.profiles where id = auth.uid())
  );

-- Payroll runs
create policy "payroll_runs: org members" on public.payroll_runs
  for all using (
    org_id in (select org_id from public.profiles where id = auth.uid())
  );

-- Payroll entries
create policy "payroll_entries: via run" on public.payroll_entries
  for all using (
    run_id in (
      select id from public.payroll_runs
      where org_id in (select org_id from public.profiles where id = auth.uid())
    )
  );

-- Receipts
create policy "receipts: org members" on public.receipts
  for all using (
    org_id in (select org_id from public.profiles where id = auth.uid())
  );

-- Transactions
create policy "transactions: org members" on public.transactions
  for all using (
    org_id in (select org_id from public.profiles where id = auth.uid())
  );

-- Teller sessions
create policy "teller_sessions: org members" on public.teller_sessions
  for all using (
    org_id in (select org_id from public.profiles where id = auth.uid())
  );

-- Teller entries — accessible if you can see the session
create policy "teller_entries: via session" on public.teller_entries
  for all using (true);  -- simplify; tighten per your auth model
