-- Supabase Database Migrations schema for CK Studio OS
-- To be executed in the Supabase SQL Editor

-- 1. Service Categories
CREATE TABLE IF NOT EXISTS service_categories (
    id TEXT PRIMARY KEY,
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_zh TEXT,
    description_en TEXT,
    is_public BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0
);

-- 2. Service Items (CMS Service Catalog)
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES service_categories(id),
    title_zh TEXT NOT NULL,
    title_en TEXT NOT NULL,
    short_description_zh TEXT,
    short_description_en TEXT,
    long_description_zh TEXT,
    long_description_en TEXT,
    deliverables_zh TEXT[],
    deliverables_en TEXT[],
    requirements_zh TEXT[],
    requirements_en TEXT[],
    base_price DECIMAL NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'TWD',
    price_label_zh TEXT,
    price_label_en TEXT,
    billing_type TEXT NOT NULL, -- fixed, starting_from, hourly, monthly, yearly, custom_quote
    deposit_percent INT DEFAULT 50,
    estimated_delivery_days INT DEFAULT 5,
    revision_count INT DEFAULT 2,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    requires_meeting BOOLEAN DEFAULT false,
    requires_contract BOOLEAN DEFAULT true,
    requires_remote_access BOOLEAN DEFAULT false,
    requires_client_materials BOOLEAN DEFAULT false,
    related_add_on_ids TEXT[],
    related_contract_template_id TEXT,
    stripe_price_id TEXT,
    stripe_payment_link TEXT,
    status TEXT DEFAULT 'active', -- draft, active, hidden, archived
    visibility TEXT DEFAULT 'public', -- public, hidden, private
    availability TEXT DEFAULT 'available_now', -- available_now, consultation_required, waitlist, not_available
    show_on_home BOOLEAN DEFAULT true,
    show_on_services_page BOOLEAN DEFAULT true,
    show_on_pricing_page BOOLEAN DEFAULT true,
    show_on_start_project_page BOOLEAN DEFAULT true,
    show_in_quote_builder BOOLEAN DEFAULT true,
    show_in_admin_only BOOLEAN DEFAULT false,
    allow_direct_checkout BOOLEAN DEFAULT false,
    allow_quote_request BOOLEAN DEFAULT true,
    allow_line_consultation BOOLEAN DEFAULT true,
    allow_booking BOOLEAN DEFAULT true,
    allow_waitlist BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Projects Showcase CMS
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title_zh TEXT NOT NULL,
    title_en TEXT NOT NULL,
    category TEXT NOT NULL,
    description_zh TEXT NOT NULL,
    description_en TEXT NOT NULL,
    long_description_zh TEXT,
    long_description_en TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    features_zh TEXT[] DEFAULT '{}',
    features_en TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active',
    is_featured BOOLEAN DEFAULT false,
    cover_style TEXT DEFAULT 'purple-glow',
    sort_order INT DEFAULT 0,
    problem_zh TEXT,
    problem_en TEXT,
    solution_zh TEXT,
    solution_en TEXT,
    result_zh TEXT,
    result_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Pricing Plans
CREATE TABLE IF NOT EXISTS pricing_plans (
    id TEXT PRIMARY KEY,
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_zh TEXT,
    description_en TEXT,
    base_price DECIMAL NOT NULL,
    currency TEXT DEFAULT 'TWD',
    price_label_zh TEXT,
    price_label_en TEXT,
    billing_type TEXT NOT NULL, -- one-time, monthly, yearly, milestone
    deposit_percent INT DEFAULT 50,
    revision_count INT DEFAULT 2,
    estimated_delivery_days INT DEFAULT 7,
    features_zh TEXT[] DEFAULT '{}',
    features_en TEXT[] DEFAULT '{}',
    add_on_ids TEXT[] DEFAULT '{}',
    is_recommended BOOLEAN DEFAULT false,
    visibility TEXT DEFAULT 'public',
    status TEXT DEFAULT 'active',
    show_on_home BOOLEAN DEFAULT true,
    show_on_pricing_page BOOLEAN DEFAULT true,
    show_in_quote_builder BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    stripe_price_id TEXT,
    stripe_payment_link TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Add-Ons
CREATE TABLE IF NOT EXISTS add_ons (
    id TEXT PRIMARY KEY,
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_zh TEXT,
    description_en TEXT,
    price DECIMAL NOT NULL,
    currency TEXT DEFAULT 'TWD',
    unit TEXT DEFAULT 'flat',
    category TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Clients CRM
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('individual', 'company')),
    name TEXT NOT NULL,
    company_name TEXT,
    tax_id TEXT,
    contact_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    line_id TEXT,
    industry TEXT,
    source TEXT,
    notes TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Inquiries
CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    line_id TEXT,
    company TEXT,
    tax_id TEXT,
    industry TEXT,
    project_type TEXT,
    selected_plan_id TEXT,
    selected_service_ids TEXT[],
    budget_range TEXT,
    timeline TEXT,
    message TEXT,
    need_meeting BOOLEAN DEFAULT false,
    preferred_contact_method TEXT,
    language_preference TEXT DEFAULT 'zh',
    invoice_requirement BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Quotes (Custom Estimates)
CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    quote_number TEXT UNIQUE NOT NULL,
    client_id TEXT REFERENCES clients(id),
    selected_plan_id TEXT,
    custom_title_zh TEXT,
    custom_title_en TEXT,
    subtotal DECIMAL NOT NULL,
    discount DECIMAL DEFAULT 0,
    tax DECIMAL DEFAULT 0,
    total DECIMAL NOT NULL,
    deposit_percent INT DEFAULT 50,
    deposit_amount DECIMAL NOT NULL,
    balance_amount DECIMAL NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    public_token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'draft',
    notes_zh TEXT,
    notes_en TEXT,
    terms_zh TEXT,
    terms_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Quote Line Items
CREATE TABLE IF NOT EXISTS quote_line_items (
    id TEXT PRIMARY KEY,
    quote_id TEXT REFERENCES quotes(id) ON DELETE CASCADE,
    title_zh TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_zh TEXT,
    description_en TEXT,
    quantity INT DEFAULT 1,
    unit_price DECIMAL NOT NULL,
    amount DECIMAL NOT NULL,
    type TEXT DEFAULT 'service'
);

-- 10. Contracts
CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    contract_number TEXT UNIQUE NOT NULL,
    quote_id TEXT REFERENCES quotes(id),
    client_id TEXT REFERENCES clients(id),
    template_id TEXT,
    project_name TEXT NOT NULL,
    project_description TEXT,
    service_scope_zh TEXT,
    service_scope_en TEXT,
    amount DECIMAL NOT NULL,
    deposit_amount DECIMAL NOT NULL,
    balance_amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'draft',
    content_zh TEXT,
    content_en TEXT,
    public_token TEXT UNIQUE NOT NULL,
    signature_name TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 11. Contract Templates
CREATE TABLE IF NOT EXISTS contract_templates (
    id TEXT PRIMARY KEY,
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category TEXT,
    content_zh TEXT,
    content_en TEXT,
    variables TEXT[],
    status TEXT DEFAULT 'active',
    version INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 12. Payments Ledger
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    payment_number TEXT UNIQUE NOT NULL,
    client_id TEXT REFERENCES clients(id),
    quote_id TEXT REFERENCES quotes(id),
    contract_id TEXT REFERENCES contracts(id),
    provider TEXT NOT NULL, -- stripe, manual, ecpay, newebpay
    amount DECIMAL NOT NULL,
    currency TEXT DEFAULT 'TWD',
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    checkout_url TEXT,
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 13. Waitlists
CREATE TABLE IF NOT EXISTS waitlists (
    id TEXT PRIMARY KEY,
    service_item_id TEXT REFERENCES services(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    line_id TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 14. Billing Settings
CREATE TABLE IF NOT EXISTS billing_settings (
    id INT PRIMARY KEY DEFAULT 1,
    enable_stripe BOOLEAN DEFAULT true,
    enable_manual_payment BOOLEAN DEFAULT true,
    enable_ecpay BOOLEAN DEFAULT false,
    enable_neweb_pay BOOLEAN DEFAULT false,
    show_invoice_fields BOOLEAN DEFAULT false,
    show_tax_id_field BOOLEAN DEFAULT false,
    show_invoice_title_field BOOLEAN DEFAULT false,
    show_carrier_field BOOLEAN DEFAULT false,
    enable_receipt_download BOOLEAN DEFAULT true,
    enable_payment_proof_download BOOLEAN DEFAULT true,
    enable_taiwan_e_invoice BOOLEAN DEFAULT false,
    require_billing_info_before_payment BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 15. Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
    id INT PRIMARY KEY DEFAULT 1,
    studio_name TEXT DEFAULT 'CK Studio',
    tagline_zh TEXT,
    tagline_en TEXT,
    email TEXT,
    phone TEXT,
    official_line_url TEXT,
    booking_url TEXT,
    socials JSONB,
    default_language TEXT DEFAULT 'zh',
    default_theme TEXT DEFAULT 'dark',
    brand_color TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 16. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    before JSONB,
    after JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
