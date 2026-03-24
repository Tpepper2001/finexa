-- Demo seed data for local development
-- Run: supabase db reset (this will apply migrations + seed)

-- Demo organization
insert into public.organizations (id, name, address, currency)
values ('00000000-0000-0000-0000-000000000001', 'Finexa Demo Co.', '14 Marina St, Lagos Island', 'NGN');

-- Demo employees
insert into public.employees (org_id, full_name, role, salary_ngn, bank_name, bank_account)
values
  ('00000000-0000-0000-0000-000000000001', 'Ada Okonkwo',   'Lead Engineer',    650000, 'GTBank',  '0123456789'),
  ('00000000-0000-0000-0000-000000000001', 'Chidi Eze',     'Product Manager',  500000, 'Zenith',  '9876543210'),
  ('00000000-0000-0000-0000-000000000001', 'Ngozi Adeyemi', 'Finance Officer',  420000, 'Access',  '1122334455');

-- Demo invoices
insert into public.invoices (org_id, client_name, client_email, status, due_date, total_ngn, notes)
values
  ('00000000-0000-0000-0000-000000000001', 'Acme Corp Ltd',        'billing@acme.ng',   'paid',    '2024-12-31', 1250000, 'Q4 consulting services'),
  ('00000000-0000-0000-0000-000000000001', 'Starfield Finance',    'ap@starfield.com',  'pending', '2025-01-15', 850000,  'Software license renewal'),
  ('00000000-0000-0000-0000-000000000001', 'Blue Horizon Ltd',     'hello@blueh.ng',    'overdue', '2024-11-30', 320000,  'Monthly retainer'),
  ('00000000-0000-0000-0000-000000000001', 'Nova Merchant Bank',   'ops@nova.ng',       'draft',   '2025-02-28', 2100000, 'API integration project');

-- Demo transactions
insert into public.transactions (org_id, type, amount, direction, reference, description)
values
  ('00000000-0000-0000-0000-000000000001', 'invoice_payment', 1250000, 'credit', 'INV-001-PMT', 'Payment from Acme Corp'),
  ('00000000-0000-0000-0000-000000000001', 'payroll',         1570000, 'debit',  'PAY-DEC-2024','December payroll disbursement'),
  ('00000000-0000-0000-0000-000000000001', 'expense',          85000,  'debit',  'EXP-001',     'Office supplies');
