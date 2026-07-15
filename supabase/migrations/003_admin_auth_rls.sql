-- CK Studio - Supabase Auth + secure RLS
-- 執行順序：001_schema.sql → 002_seed.sql → 本檔案
-- 唯一管理員帳號：kelvinchenrichai@gmail.com

begin;

alter table public.services
  add column if not exists show_price boolean not null default true;

-- 以 Supabase Auth JWT email 判斷唯一管理員。
create or replace function public.is_ck_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'kelvinchenrichai@gmail.com';
$$;

grant execute on function public.is_ck_admin() to anon, authenticated;

-- 移除 001_schema.sql 內所有測試／寬鬆政策，避免 using(true) 留在正式環境。
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'service_categories', 'services', 'projects', 'pricing_plans', 'add_ons',
        'site_settings', 'billing_settings', 'inquiries', 'waitlist', 'clients',
        'quotes', 'quote_line_items', 'contracts', 'contract_templates',
        'payments', 'audit_logs'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end $$;

-- 公開前台：僅能讀取上架內容。
create policy "public_read_service_categories"
on public.service_categories for select
to anon, authenticated
using (is_public = true);

create policy "public_read_services"
on public.services for select
to anon, authenticated
using (
  is_public = true
  and visibility = 'public'
  and status in ('active', 'coming_soon', 'beta')
  and coalesce(show_in_admin_only, false) = false
);

create policy "public_read_projects"
on public.projects for select
to anon, authenticated
using (status = 'active');

create policy "public_read_pricing_plans"
on public.pricing_plans for select
to anon, authenticated
using (visibility = 'public' and status = 'active');

create policy "public_read_add_ons"
on public.add_ons for select
to anon, authenticated
using (status = 'active');

create policy "public_read_site_settings"
on public.site_settings for select
to anon, authenticated
using (true);

-- 公開表單：只能新增，不能讀取其他人的資料。
create policy "public_insert_inquiries"
on public.inquiries for insert
to anon, authenticated
with check (true);

create policy "public_insert_waitlist"
on public.waitlist for insert
to anon, authenticated
with check (true);

-- 管理員：登入且 email 符合時，才能完整操作後台資料。
create policy "admin_all_service_categories"
on public.service_categories for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_services"
on public.services for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_projects"
on public.projects for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_pricing_plans"
on public.pricing_plans for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_add_ons"
on public.add_ons for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_site_settings"
on public.site_settings for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_billing_settings"
on public.billing_settings for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_inquiries"
on public.inquiries for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_waitlist"
on public.waitlist for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_clients"
on public.clients for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_quotes"
on public.quotes for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_quote_line_items"
on public.quote_line_items for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_contracts"
on public.contracts for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_contract_templates"
on public.contract_templates for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_payments"
on public.payments for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

create policy "admin_all_audit_logs"
on public.audit_logs for all
to authenticated
using (public.is_ck_admin())
with check (public.is_ck_admin());

-- 明確資料表權限；RLS 仍會進一步限制每個操作。
grant select on public.service_categories, public.services, public.projects,
  public.pricing_plans, public.add_ons, public.site_settings to anon, authenticated;
grant insert on public.inquiries, public.waitlist to anon, authenticated;
grant all on public.service_categories, public.services, public.projects,
  public.pricing_plans, public.add_ons, public.site_settings, public.billing_settings,
  public.inquiries, public.waitlist, public.clients, public.quotes,
  public.quote_line_items, public.contracts, public.contract_templates,
  public.payments, public.audit_logs to authenticated;

commit;
