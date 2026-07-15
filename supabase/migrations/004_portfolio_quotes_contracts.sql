-- CK Studio - Portfolio media + secure quote/contract workflow
-- Run after 003_admin_auth_rls.sql

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- Portfolio media and external project links
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.projects
  add column if not exists cover_image_url text,
  add column if not exists gallery_image_urls text[] not null default '{}',
  add column if not exists project_url text,
  add column if not exists cta_label_zh text not null default '瀏覽專案',
  add column if not exists cta_label_en text not null default 'View project',
  add column if not exists open_in_new_tab boolean not null default true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media',
  'project-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "project_media_public_read" on storage.objects;
drop policy if exists "project_media_admin_insert" on storage.objects;
drop policy if exists "project_media_admin_update" on storage.objects;
drop policy if exists "project_media_admin_delete" on storage.objects;

create policy "project_media_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'project-media');

create policy "project_media_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'project-media' and public.is_ck_admin());

create policy "project_media_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'project-media' and public.is_ck_admin())
with check (bucket_id = 'project-media' and public.is_ck_admin());

create policy "project_media_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'project-media' and public.is_ck_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- Quote / contract workflow metadata
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.quotes
  add column if not exists contract_template_id text references public.contract_templates(id);

alter table public.contracts
  add column if not exists signature_consent boolean not null default false,
  add column if not exists signature_user_agent text;

-- A usable default template. Existing templates stay editable in the admin.
insert into public.contract_templates (
  id, name_zh, name_en, category, content_zh, content_en,
  variables, status, version
)
values (
  'tmpl-default',
  'CK Studio 標準技術服務合約',
  'CK Studio Standard Service Agreement',
  'general',
  '<h2>CK Studio 技術服務合約</h2>
<p>委託方（甲方）：{{clientName}} {{companyName}}</p>
<p>承攬方（乙方）：CK Studio 技術工作室</p>
<h3>一、專案內容</h3>
<p>專案名稱：{{projectNameZh}}</p>
<p>服務範圍：{{serviceScopeZh}}</p>
<h3>二、專案費用</h3>
<p>總金額：新台幣 {{totalAmount}} 元。</p>
<p>訂金 {{depositPercent}}%：新台幣 {{depositAmount}} 元；尾款：新台幣 {{balanceAmount}} 元。</p>
<h3>三、交付與修改</h3>
<p>預估交付期為 {{deliveryDays}} 個工作天，包含 {{revisionCount}} 次約定範圍內修改。</p>
<h3>四、智慧財產與保密</h3>
<p>甲方付清全部款項後取得本案客製成果之約定使用權；雙方對專案中取得的非公開資訊負保密義務。</p>
<h3>五、電子簽署</h3>
<p>甲方勾選同意並輸入簽署姓名後，即表示已閱讀、理解並同意本合約內容。</p>',
  '<h2>CK Studio Service Agreement</h2>
<p>Client: {{clientName}} {{companyName}}</p>
<p>Provider: CK Studio</p>
<h3>1. Project</h3>
<p>Project: {{projectNameEn}}</p>
<p>Scope: {{serviceScopeEn}}</p>
<h3>2. Fees</h3>
<p>Total: TWD {{totalAmount}}.</p>
<p>Deposit {{depositPercent}}%: TWD {{depositAmount}}; balance: TWD {{balanceAmount}}.</p>
<h3>3. Delivery and revisions</h3>
<p>Estimated delivery is {{deliveryDays}} business days and includes {{revisionCount}} agreed revisions.</p>
<h3>4. Intellectual property and confidentiality</h3>
<p>Agreed usage rights transfer after full payment. Both parties must protect non-public project information.</p>
<h3>5. Electronic signature</h3>
<p>Checking the consent box and entering the legal name constitutes acceptance of this agreement.</p>',
  array[
    'clientName', 'companyName', 'projectNameZh', 'projectNameEn',
    'serviceScopeZh', 'serviceScopeEn', 'totalAmount', 'depositPercent',
    'depositAmount', 'balanceAmount', 'deliveryDays', 'revisionCount'
  ],
  'active',
  1
)
on conflict (id) do nothing;

-- The original seed created template names without body content. Fill empty bodies
-- with the standard agreement so any active template is immediately usable.
update public.contract_templates template
set content_zh = standard.content_zh,
    content_en = standard.content_en,
    variables = case when coalesce(array_length(template.variables, 1), 0) = 0 then standard.variables else template.variables end,
    updated_at = now()
from public.contract_templates standard
where standard.id = 'tmpl-default'
  and (coalesce(trim(template.content_zh), '') = '' or coalesce(trim(template.content_en), '') = '');

-- ─────────────────────────────────────────────────────────────────────────────
-- Secure public workspace functions
-- Tables remain inaccessible to anonymous users. These functions only reveal the
-- single quote/contract matching a cryptographically random public token.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.get_public_workspace(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_quote public.quotes%rowtype;
  v_contract public.contracts%rowtype;
  v_client public.clients%rowtype;
  v_line_items jsonb := '[]'::jsonb;
begin
  if coalesce(length(trim(p_token)), 0) < 20 then
    return null;
  end if;

  select * into v_quote
  from public.quotes
  where public_token = p_token
  limit 1;

  if v_quote.id is null then
    select * into v_contract
    from public.contracts
    where public_token = p_token
    limit 1;

    if v_contract.id is not null then
      select * into v_quote from public.quotes where id = v_contract.quote_id;
    end if;
  else
    select * into v_contract
    from public.contracts
    where quote_id = v_quote.id
    order by created_at desc
    limit 1;
  end if;

  if v_quote.id is null and v_contract.id is null then
    return null;
  end if;

  if v_quote.id is not null and v_quote.status = 'sent' then
    update public.quotes set status = 'viewed', updated_at = now() where id = v_quote.id;
    v_quote.status := 'viewed';
  end if;

  if v_contract.id is not null and v_contract.status = 'sent' then
    update public.contracts set status = 'viewed', updated_at = now() where id = v_contract.id;
    v_contract.status := 'viewed';
  end if;

  if v_quote.id is not null then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', item.id::text,
      'quoteId', item.quote_id::text,
      'titleZh', coalesce(item.title_zh, ''),
      'titleEn', coalesce(item.title_en, ''),
      'descriptionZh', coalesce(item.description_zh, ''),
      'descriptionEn', coalesce(item.description_en, ''),
      'quantity', item.quantity,
      'unitPrice', item.unit_price,
      'amount', item.amount,
      'type', item.type
    ) order by item.id), '[]'::jsonb)
    into v_line_items
    from public.quote_line_items item
    where item.quote_id = v_quote.id;
  end if;

  select * into v_client
  from public.clients
  where id = coalesce(v_quote.client_id, v_contract.client_id)
  limit 1;

  return jsonb_build_object(
    'quote', case when v_quote.id is null then null else jsonb_build_object(
      'id', v_quote.id::text,
      'quoteNumber', v_quote.quote_number,
      'clientId', v_quote.client_id::text,
      'selectedPlanId', v_quote.selected_plan_id,
      'contractTemplateId', v_quote.contract_template_id,
      'customTitleZh', coalesce(v_quote.custom_title_zh, ''),
      'customTitleEn', coalesce(v_quote.custom_title_en, ''),
      'subtotal', v_quote.subtotal,
      'discount', v_quote.discount,
      'tax', v_quote.tax,
      'total', v_quote.total,
      'depositPercent', v_quote.deposit_percent,
      'depositAmount', v_quote.deposit_amount,
      'balanceAmount', v_quote.balance_amount,
      'validUntil', v_quote.valid_until,
      'publicToken', v_quote.public_token,
      'status', v_quote.status,
      'notesZh', coalesce(v_quote.notes_zh, ''),
      'notesEn', coalesce(v_quote.notes_en, ''),
      'termsZh', coalesce(v_quote.terms_zh, ''),
      'termsEn', coalesce(v_quote.terms_en, ''),
      'lineItems', v_line_items,
      'createdAt', v_quote.created_at,
      'updatedAt', v_quote.updated_at
    ) end,
    'contract', case when v_contract.id is null then null else jsonb_build_object(
      'id', v_contract.id::text,
      'contractNumber', v_contract.contract_number,
      'quoteId', v_contract.quote_id::text,
      'clientId', v_contract.client_id::text,
      'templateId', v_contract.template_id,
      'projectName', coalesce(v_contract.project_name, ''),
      'projectDescription', coalesce(v_contract.project_description, ''),
      'serviceScopeZh', coalesce(v_contract.service_scope_zh, ''),
      'serviceScopeEn', coalesce(v_contract.service_scope_en, ''),
      'amount', v_contract.amount,
      'depositAmount', v_contract.deposit_amount,
      'balanceAmount', v_contract.balance_amount,
      'status', v_contract.status,
      'contentZh', coalesce(v_contract.content_zh, ''),
      'contentEn', coalesce(v_contract.content_en, ''),
      'publicToken', v_contract.public_token,
      'signatureName', v_contract.signature_name,
      'signatureConsent', v_contract.signature_consent,
      'signatureUserAgent', v_contract.signature_user_agent,
      'signedAt', v_contract.signed_at,
      'acceptedAt', v_contract.accepted_at,
      'createdAt', v_contract.created_at,
      'updatedAt', v_contract.updated_at
    ) end,
    'client', case when v_client.id is null then null else jsonb_build_object(
      'id', v_client.id::text,
      'name', v_client.name,
      'companyName', v_client.company_name,
      'contactName', v_client.contact_name,
      'email', v_client.email
    ) end
  );
end;
$$;

create or replace function public.accept_public_quote(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_quote public.quotes%rowtype;
  v_client public.clients%rowtype;
  v_template public.contract_templates%rowtype;
  v_contract_id uuid;
  v_scope_zh text;
  v_scope_en text;
  v_content_zh text;
  v_content_en text;
  v_contract_number text;
begin
  select * into v_quote from public.quotes where public_token = p_token limit 1;
  if v_quote.id is null then
    raise exception 'QUOTE_NOT_FOUND';
  end if;

  if v_quote.valid_until is not null and v_quote.valid_until < now() then
    update public.quotes set status = 'expired', updated_at = now() where id = v_quote.id;
    raise exception 'QUOTE_EXPIRED';
  end if;

  if v_quote.status not in ('sent', 'viewed', 'accepted') then
    raise exception 'QUOTE_NOT_AVAILABLE';
  end if;

  update public.quotes
  set status = 'accepted', updated_at = now()
  where id = v_quote.id;

  select id into v_contract_id from public.contracts where quote_id = v_quote.id limit 1;

  if v_contract_id is null then
    select * into v_client from public.clients where id = v_quote.client_id;
    select * into v_template
    from public.contract_templates
    where id = v_quote.contract_template_id
       or (v_quote.contract_template_id is null and status = 'active')
    order by case when id = v_quote.contract_template_id then 0 else 1 end, created_at
    limit 1;

    if v_template.id is null then
      raise exception 'CONTRACT_TEMPLATE_NOT_FOUND';
    end if;

    select coalesce(string_agg(coalesce(title_zh, ''), '、' order by id), ''),
           coalesce(string_agg(coalesce(title_en, ''), ', ' order by id), '')
    into v_scope_zh, v_scope_en
    from public.quote_line_items
    where quote_id = v_quote.id;

    v_content_zh := coalesce(v_template.content_zh, '');
    v_content_en := coalesce(v_template.content_en, '');

    v_content_zh := replace(v_content_zh, '{{clientName}}', coalesce(v_client.contact_name, v_client.name, ''));
    v_content_zh := replace(v_content_zh, '{{companyName}}', coalesce(v_client.company_name, ''));
    v_content_zh := replace(v_content_zh, '{{taxId}}', coalesce(v_client.tax_id, ''));
    v_content_zh := replace(v_content_zh, '{{projectName}}', coalesce(v_quote.custom_title_zh, ''));
    v_content_zh := replace(v_content_zh, '{{projectNameZh}}', coalesce(v_quote.custom_title_zh, ''));
    v_content_zh := replace(v_content_zh, '{{projectNameEn}}', coalesce(v_quote.custom_title_en, ''));
    v_content_zh := replace(v_content_zh, '{{serviceScope}}', v_scope_zh);
    v_content_zh := replace(v_content_zh, '{{serviceScopeZh}}', v_scope_zh);
    v_content_zh := replace(v_content_zh, '{{serviceScopeEn}}', v_scope_en);
    v_content_zh := replace(v_content_zh, '{{totalAmount}}', trim(to_char(v_quote.total, 'FM999,999,999,990')));
    v_content_zh := replace(v_content_zh, '{{depositPercent}}', trim(to_char(v_quote.deposit_percent, 'FM990')));
    v_content_zh := replace(v_content_zh, '{{depositAmount}}', trim(to_char(v_quote.deposit_amount, 'FM999,999,999,990')));
    v_content_zh := replace(v_content_zh, '{{balanceAmount}}', trim(to_char(v_quote.balance_amount, 'FM999,999,999,990')));
    v_content_zh := replace(v_content_zh, '{{deliveryDays}}', '30');
    v_content_zh := replace(v_content_zh, '{{revisionCount}}', '2');

    v_content_en := replace(v_content_en, '{{clientName}}', coalesce(v_client.contact_name, v_client.name, ''));
    v_content_en := replace(v_content_en, '{{companyName}}', coalesce(v_client.company_name, ''));
    v_content_en := replace(v_content_en, '{{taxId}}', coalesce(v_client.tax_id, ''));
    v_content_en := replace(v_content_en, '{{projectName}}', coalesce(v_quote.custom_title_en, ''));
    v_content_en := replace(v_content_en, '{{projectNameZh}}', coalesce(v_quote.custom_title_zh, ''));
    v_content_en := replace(v_content_en, '{{projectNameEn}}', coalesce(v_quote.custom_title_en, ''));
    v_content_en := replace(v_content_en, '{{serviceScope}}', v_scope_en);
    v_content_en := replace(v_content_en, '{{serviceScopeZh}}', v_scope_zh);
    v_content_en := replace(v_content_en, '{{serviceScopeEn}}', v_scope_en);
    v_content_en := replace(v_content_en, '{{totalAmount}}', trim(to_char(v_quote.total, 'FM999,999,999,990')));
    v_content_en := replace(v_content_en, '{{depositPercent}}', trim(to_char(v_quote.deposit_percent, 'FM990')));
    v_content_en := replace(v_content_en, '{{depositAmount}}', trim(to_char(v_quote.deposit_amount, 'FM999,999,999,990')));
    v_content_en := replace(v_content_en, '{{balanceAmount}}', trim(to_char(v_quote.balance_amount, 'FM999,999,999,990')));
    v_content_en := replace(v_content_en, '{{deliveryDays}}', '30');
    v_content_en := replace(v_content_en, '{{revisionCount}}', '2');

    v_contract_number := 'C-' || to_char(now(), 'YYYYMMDD-HH24MISS');

    insert into public.contracts (
      contract_number, quote_id, client_id, template_id, project_name,
      project_description, service_scope_zh, service_scope_en, amount,
      deposit_amount, balance_amount, status, content_zh, content_en,
      public_token, signature_consent
    ) values (
      v_contract_number, v_quote.id, v_quote.client_id, v_template.id,
      coalesce(v_quote.custom_title_zh, v_quote.custom_title_en, '新專案'),
      coalesce(v_quote.notes_zh, ''), v_scope_zh, v_scope_en,
      v_quote.total, v_quote.deposit_amount, v_quote.balance_amount,
      'sent', v_content_zh, v_content_en, v_quote.public_token, false
    ) returning id into v_contract_id;
  end if;

  insert into public.audit_logs (actor, action, entity_type, entity_id, after)
  values (
    'public-client', 'accept_quote', 'quotes', v_quote.id::text,
    jsonb_build_object('tokenSuffix', right(p_token, 6), 'acceptedAt', now())
  );

  return public.get_public_workspace(p_token);
end;
$$;

create or replace function public.sign_public_contract(
  p_token text,
  p_signature_name text,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_contract public.contracts%rowtype;
begin
  if coalesce(length(trim(p_signature_name)), 0) < 2 then
    raise exception 'SIGNATURE_NAME_REQUIRED';
  end if;

  select * into v_contract
  from public.contracts
  where public_token = p_token
  limit 1;

  if v_contract.id is null then
    raise exception 'CONTRACT_NOT_FOUND';
  end if;

  if v_contract.status not in ('sent', 'viewed', 'accepted', 'signed') then
    raise exception 'CONTRACT_NOT_SIGNABLE';
  end if;

  update public.contracts
  set signature_name = trim(p_signature_name),
      signature_consent = true,
      signature_user_agent = left(coalesce(p_user_agent, ''), 1000),
      signed_at = coalesce(signed_at, now()),
      accepted_at = coalesce(accepted_at, now()),
      status = 'signed',
      updated_at = now()
  where id = v_contract.id;

  insert into public.audit_logs (actor, action, entity_type, entity_id, after)
  values (
    'public-client', 'sign_contract', 'contracts', v_contract.id::text,
    jsonb_build_object('signatureName', trim(p_signature_name), 'signedAt', now())
  );

  return public.get_public_workspace(p_token);
end;
$$;

revoke all on function public.get_public_workspace(text) from public;
revoke all on function public.accept_public_quote(text) from public;
revoke all on function public.sign_public_contract(text, text, text) from public;

grant execute on function public.get_public_workspace(text) to anon, authenticated;
grant execute on function public.accept_public_quote(text) to anon, authenticated;
grant execute on function public.sign_public_contract(text, text, text) to anon, authenticated;

commit;
