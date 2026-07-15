-- CK Studio - Full Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- SERVICE CATEGORIES
-- =====================
create table if not exists service_categories (
  id text primary key,
  name_zh text not null,
  name_en text not null,
  description_zh text,
  description_en text,
  is_public boolean default true,
  sort_order integer default 0,
  icon_name text,
  created_at timestamptz default now()
);

-- =====================
-- SERVICES
-- =====================
create table if not exists services (
  id text primary key,
  category_id text references service_categories(id),
  title_zh text not null,
  title_en text not null,
  short_description_zh text,
  short_description_en text,
  long_description_zh text,
  long_description_en text,
  deliverables_zh text[] default '{}',
  deliverables_en text[] default '{}',
  requirements_zh text[] default '{}',
  requirements_en text[] default '{}',
  base_price numeric default 0,
  currency text default 'TWD',
  price_label_zh text,
  price_label_en text,
  billing_type text default 'starting_from',
  deposit_percent numeric default 50,
  estimated_delivery_days integer default 30,
  revision_count integer default 2,
  is_public boolean default true,
  is_featured boolean default false,
  requires_meeting boolean default false,
  requires_contract boolean default false,
  requires_remote_access boolean default false,
  requires_client_materials boolean default false,
  related_add_on_ids text[] default '{}',
  related_contract_template_id text,
  stripe_price_id text,
  stripe_payment_link text,
  status text default 'active',
  visibility text default 'public',
  availability text default 'available_now',
  show_on_home boolean default true,
  show_on_services_page boolean default true,
  show_on_pricing_page boolean default false,
  show_on_start_project_page boolean default true,
  show_in_quote_builder boolean default true,
  show_in_admin_only boolean default false,
  allow_direct_checkout boolean default false,
  allow_quote_request boolean default true,
  allow_line_consultation boolean default true,
  allow_booking boolean default true,
  allow_waitlist boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- PROJECTS
-- =====================
create table if not exists projects (
  id text primary key,
  slug text unique not null,
  title_zh text not null,
  title_en text not null,
  category text,
  description_zh text,
  description_en text,
  long_description_zh text,
  long_description_en text,
  tech_stack text[] default '{}',
  features_zh text[] default '{}',
  features_en text[] default '{}',
  status text default 'active',
  is_featured boolean default false,
  cover_style text default 'purple-glow',
  sort_order integer default 0,
  problem_zh text,
  problem_en text,
  solution_zh text,
  solution_en text,
  result_zh text,
  result_en text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- PRICING PLANS
-- =====================
create table if not exists pricing_plans (
  id text primary key,
  name_zh text not null,
  name_en text not null,
  description_zh text,
  description_en text,
  base_price numeric default 0,
  currency text default 'TWD',
  price_label_zh text,
  price_label_en text,
  billing_type text default 'one-time',
  deposit_percent numeric default 50,
  revision_count integer default 2,
  estimated_delivery_days integer default 30,
  features_zh text[] default '{}',
  features_en text[] default '{}',
  add_on_ids text[] default '{}',
  is_recommended boolean default false,
  visibility text default 'public',
  status text default 'active',
  show_on_home boolean default true,
  show_on_pricing_page boolean default true,
  show_in_quote_builder boolean default true,
  is_featured boolean default false,
  stripe_price_id text,
  stripe_payment_link text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- ADD-ONS
-- =====================
create table if not exists add_ons (
  id text primary key,
  name_zh text not null,
  name_en text not null,
  description_zh text,
  description_en text,
  price numeric default 0,
  currency text default 'TWD',
  unit text default 'flat',
  category text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- CLIENTS
-- =====================
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  type text default 'individual',
  name text not null,
  company_name text,
  tax_id text,
  contact_name text,
  email text,
  phone text,
  line_id text,
  industry text,
  source text,
  notes text,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- INQUIRIES
-- =====================
create table if not exists inquiries (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  name text not null,
  email text not null,
  phone text,
  line_id text,
  company text,
  tax_id text,
  industry text,
  project_type text,
  selected_plan_id text,
  selected_service_ids text[] default '{}',
  budget_range text,
  timeline text,
  message text,
  need_meeting boolean default false,
  preferred_contact_method text default 'LINE',
  language_preference text default 'zh',
  invoice_requirement boolean default false,
  status text default 'new',
  created_at timestamptz default now()
);

-- =====================
-- QUOTES
-- =====================
create table if not exists quotes (
  id uuid primary key default uuid_generate_v4(),
  quote_number text unique not null,
  client_id uuid references clients(id),
  selected_plan_id text,
  custom_title_zh text,
  custom_title_en text,
  subtotal numeric default 0,
  discount numeric default 0,
  tax numeric default 0,
  total numeric default 0,
  deposit_percent numeric default 50,
  deposit_amount numeric default 0,
  balance_amount numeric default 0,
  valid_until timestamptz,
  public_token text unique default uuid_generate_v4()::text,
  status text default 'draft',
  notes_zh text,
  notes_en text,
  terms_zh text,
  terms_en text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- QUOTE LINE ITEMS
-- =====================
create table if not exists quote_line_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references quotes(id) on delete cascade,
  title_zh text,
  title_en text,
  description_zh text,
  description_en text,
  quantity integer default 1,
  unit_price numeric default 0,
  amount numeric default 0,
  type text default 'service'
);

-- =====================
-- CONTRACT TEMPLATES
-- =====================
create table if not exists contract_templates (
  id text primary key,
  name_zh text not null,
  name_en text not null,
  category text,
  content_zh text,
  content_en text,
  variables text[] default '{}',
  status text default 'active',
  version integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- CONTRACTS
-- =====================
create table if not exists contracts (
  id uuid primary key default uuid_generate_v4(),
  contract_number text unique not null,
  quote_id uuid references quotes(id),
  client_id uuid references clients(id),
  template_id text references contract_templates(id),
  project_name text,
  project_description text,
  service_scope_zh text,
  service_scope_en text,
  amount numeric default 0,
  deposit_amount numeric default 0,
  balance_amount numeric default 0,
  status text default 'draft',
  content_zh text,
  content_en text,
  public_token text unique default uuid_generate_v4()::text,
  signature_name text,
  signed_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- PAYMENTS
-- =====================
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  payment_number text unique not null,
  client_id uuid references clients(id),
  quote_id uuid references quotes(id),
  contract_id uuid references contracts(id),
  provider text default 'stripe',
  amount numeric default 0,
  currency text default 'TWD',
  status text default 'pending',
  payment_method text,
  checkout_url text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- =====================
-- WAITLIST
-- =====================
create table if not exists waitlist (
  id uuid primary key default uuid_generate_v4(),
  service_item_id text references services(id),
  name text not null,
  email text not null,
  phone text,
  line_id text,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

-- =====================
-- BILLING SETTINGS
-- =====================
create table if not exists billing_settings (
  id integer primary key default 1,
  enable_stripe boolean default true,
  enable_manual_payment boolean default true,
  enable_ecpay boolean default false,
  enable_newebpay boolean default false,
  show_invoice_fields boolean default false,
  show_tax_id_field boolean default false,
  show_invoice_title_field boolean default false,
  show_carrier_field boolean default false,
  enable_receipt_download boolean default true,
  enable_payment_proof_download boolean default true,
  enable_taiwan_e_invoice boolean default false,
  require_billing_info_before_payment boolean default false,
  updated_at timestamptz default now()
);
insert into billing_settings (id) values (1) on conflict do nothing;

-- =====================
-- SITE SETTINGS
-- =====================
create table if not exists site_settings (
  id integer primary key default 1,
  studio_name text default 'CK Studio',
  tagline_zh text default '為交易員、創作者與企業打造 AI 驅動的智能軟體系統。',
  tagline_en text default 'Building intelligent software for traders, creators, and businesses.',
  email text default 'hello@ckstudio.dev',
  phone text default '+886 900 000 000',
  official_line_url text default 'https://lin.ee/your-line-placeholder',
  booking_url text default 'https://calendly.com/ck-studio',
  socials jsonb default '{}',
  default_language text default 'zh',
  default_theme text default 'dark',
  brand_color text default '#3B82F6',
  updated_at timestamptz default now()
);
insert into site_settings (id) values (1) on conflict do nothing;

-- =====================
-- AUDIT LOGS
-- =====================
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor text,
  action text,
  entity_type text,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz default now()
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
-- Allow public read for front-facing data
alter table service_categories enable row level security;
alter table services enable row level security;
alter table projects enable row level security;
alter table pricing_plans enable row level security;
alter table add_ons enable row level security;
alter table site_settings enable row level security;
alter table billing_settings enable row level security;
alter table inquiries enable row level security;
alter table waitlist enable row level security;
alter table clients enable row level security;
alter table quotes enable row level security;
alter table quote_line_items enable row level security;
alter table contracts enable row level security;
alter table contract_templates enable row level security;
alter table payments enable row level security;
alter table audit_logs enable row level security;

-- Public read policies (front-end can read public content)
create policy "public read service_categories" on service_categories for select using (is_public = true);
create policy "public read services" on services for select using (visibility = 'public' and status != 'archived');
create policy "public read projects" on projects for select using (status = 'active');
create policy "public read pricing_plans" on pricing_plans for select using (visibility = 'public' and status = 'active');
create policy "public read add_ons" on add_ons for select using (status = 'active');
create policy "public read site_settings" on site_settings for select using (true);
create policy "public read billing_settings" on billing_settings for select using (true);
create policy "public read contract_templates" on contract_templates for select using (status = 'active');

-- Public can submit inquiries and waitlist
create policy "public insert inquiries" on inquiries for insert with check (true);
create policy "public insert waitlist" on waitlist for insert with check (true);

-- Public can read their own quote/contract by token
create policy "public read quotes by token" on quotes for select using (true);
create policy "public read contracts by token" on contracts for select using (true);
create policy "public read quote_line_items" on quote_line_items for select using (true);
create policy "public update contract signature" on contracts for update using (true) with check (true);

-- Admin full access (using publishable key for now - tighten with auth later)
create policy "admin all clients" on clients for all using (true);
create policy "admin all inquiries read" on inquiries for select using (true);
create policy "admin all quotes" on quotes for all using (true);
create policy "admin all quote_line_items" on quote_line_items for all using (true);
create policy "admin all contracts" on contracts for all using (true);
create policy "admin all payments" on payments for all using (true);
create policy "admin all audit_logs" on audit_logs for all using (true);
create policy "admin write services" on services for all using (true);
create policy "admin write projects" on projects for all using (true);
create policy "admin write pricing_plans" on pricing_plans for all using (true);
create policy "admin write add_ons" on add_ons for all using (true);
create policy "admin write site_settings" on site_settings for all using (true);
create policy "admin write billing_settings" on billing_settings for all using (true);
create policy "admin write service_categories" on service_categories for all using (true);
create policy "admin write contract_templates" on contract_templates for all using (true);
