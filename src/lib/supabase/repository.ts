import { supabase, isSupabaseEnabled } from './client';
import {
  Project, Service, ServiceCategory, PricingPlan, AddOn,
  Client, Inquiry, Quote, QuoteLineItem, Contract,
  ContractTemplate, Payment, BillingSettings, SiteSettings,
  Waitlist, AuditLog
} from '../../types';

// ─── helpers ────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function now() {
  return new Date().toISOString();
}

function assertSupabase(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('Supabase not initialised');
  return supabase;
}

// ─── row mappers (snake_case DB → camelCase TS) ─────────────────────────────

function mapProject(r: any): Project {
  return {
    id: r.id, slug: r.slug,
    titleZh: r.title_zh, titleEn: r.title_en,
    category: r.category,
    descriptionZh: r.description_zh, descriptionEn: r.description_en,
    longDescriptionZh: r.long_description_zh ?? '', longDescriptionEn: r.long_description_en ?? '',
    techStack: r.tech_stack ?? [],
    featuresZh: r.features_zh ?? [], featuresEn: r.features_en ?? [],
    status: r.status, isFeatured: r.is_featured,
    coverStyle: r.cover_style, sortOrder: r.sort_order,
    problemZh: r.problem_zh, problemEn: r.problem_en,
    solutionZh: r.solution_zh, solutionEn: r.solution_en,
    resultZh: r.result_zh, resultEn: r.result_en,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapService(r: any): Service {
  return {
    id: r.id, categoryId: r.category_id,
    titleZh: r.title_zh, titleEn: r.title_en,
    shortDescriptionZh: r.short_description_zh ?? '', shortDescriptionEn: r.short_description_en ?? '',
    longDescriptionZh: r.long_description_zh ?? '', longDescriptionEn: r.long_description_en ?? '',
    deliverablesZh: r.deliverables_zh ?? [], deliverablesEn: r.deliverables_en ?? [],
    requirementsZh: r.requirements_zh ?? [], requirementsEn: r.requirements_en ?? [],
    basePrice: r.base_price, currency: r.currency,
    priceLabelZh: r.price_label_zh ?? '', priceLabelEn: r.price_label_en ?? '',
    billingType: r.billing_type,
    depositPercent: r.deposit_percent, estimatedDeliveryDays: r.estimated_delivery_days,
    revisionCount: r.revision_count, showPrice: r.show_price ?? true,
    isPublic: r.is_public, isFeatured: r.is_featured,
    requiresMeeting: r.requires_meeting, requiresContract: r.requires_contract,
    requiresRemoteAccess: r.requires_remote_access, requiresClientMaterials: r.requires_client_materials,
    relatedAddOnIds: r.related_add_on_ids ?? [],
    relatedContractTemplateId: r.related_contract_template_id ?? '',
    stripePriceId: r.stripe_price_id ?? '', stripePaymentLink: r.stripe_payment_link ?? '',
    status: r.status, visibility: r.visibility, availability: r.availability,
    showOnHome: r.show_on_home, showOnServicesPage: r.show_on_services_page,
    showOnPricingPage: r.show_on_pricing_page, showOnStartProjectPage: r.show_on_start_project_page,
    showInQuoteBuilder: r.show_in_quote_builder, showInAdminOnly: r.show_in_admin_only,
    allowDirectCheckout: r.allow_direct_checkout, allowQuoteRequest: r.allow_quote_request,
    allowLineConsultation: r.allow_line_consultation, allowBooking: r.allow_booking,
    allowWaitlist: r.allow_waitlist,
    sortOrder: r.sort_order, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapServiceCategory(r: any): ServiceCategory {
  return {
    id: r.id, nameZh: r.name_zh, nameEn: r.name_en,
    descriptionZh: r.description_zh ?? '', descriptionEn: r.description_en ?? '',
    isPublic: r.is_public, sortOrder: r.sort_order, iconName: r.icon_name ?? '',
  };
}

function mapPricingPlan(r: any): PricingPlan {
  return {
    id: r.id, nameZh: r.name_zh, nameEn: r.name_en,
    descriptionZh: r.description_zh ?? '', descriptionEn: r.description_en ?? '',
    basePrice: r.base_price, currency: r.currency,
    priceLabelZh: r.price_label_zh ?? '', priceLabelEn: r.price_label_en ?? '',
    billingType: r.billing_type,
    depositPercent: r.deposit_percent, revisionCount: r.revision_count,
    estimatedDeliveryDays: r.estimated_delivery_days,
    featuresZh: r.features_zh ?? [], featuresEn: r.features_en ?? [],
    addOnIds: r.add_on_ids ?? [], isRecommended: r.is_recommended,
    visibility: r.visibility, status: r.status,
    showOnHome: r.show_on_home, showOnPricingPage: r.show_on_pricing_page,
    showInQuoteBuilder: r.show_in_quote_builder, isFeatured: r.is_featured,
    stripePriceId: r.stripe_price_id ?? '', stripePaymentLink: r.stripe_payment_link ?? '',
    sortOrder: r.sort_order, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapAddOn(r: any): AddOn {
  return {
    id: r.id, nameZh: r.name_zh, nameEn: r.name_en,
    descriptionZh: r.description_zh ?? '', descriptionEn: r.description_en ?? '',
    price: r.price, currency: r.currency, unit: r.unit, category: r.category,
    status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapClient(r: any): Client {
  return {
    id: r.id, type: r.type, name: r.name,
    companyName: r.company_name, taxId: r.tax_id, contactName: r.contact_name,
    email: r.email, phone: r.phone, lineId: r.line_id,
    industry: r.industry, source: r.source, notes: r.notes, status: r.status,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapInquiry(r: any): Inquiry {
  return {
    id: r.id, clientId: r.client_id,
    name: r.name, email: r.email, phone: r.phone, lineId: r.line_id,
    company: r.company, taxId: r.tax_id, industry: r.industry,
    projectType: r.project_type, selectedPlanId: r.selected_plan_id,
    selectedServiceIds: r.selected_service_ids ?? [],
    budgetRange: r.budget_range, timeline: r.timeline, message: r.message,
    needMeeting: r.need_meeting,
    preferredContactMethod: r.preferred_contact_method,
    languagePreference: r.language_preference,
    invoiceRequirement: r.invoice_requirement,
    status: r.status, createdAt: r.created_at,
  };
}

function mapQuote(r: any, lineItems: QuoteLineItem[] = []): Quote {
  return {
    id: r.id, quoteNumber: r.quote_number, clientId: r.client_id,
    selectedPlanId: r.selected_plan_id,
    customTitleZh: r.custom_title_zh ?? '', customTitleEn: r.custom_title_en ?? '',
    subtotal: r.subtotal, discount: r.discount, tax: r.tax, total: r.total,
    depositPercent: r.deposit_percent, depositAmount: r.deposit_amount,
    balanceAmount: r.balance_amount, validUntil: r.valid_until,
    publicToken: r.public_token, status: r.status,
    notesZh: r.notes_zh ?? '', notesEn: r.notes_en ?? '',
    termsZh: r.terms_zh ?? '', termsEn: r.terms_en ?? '',
    lineItems, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapLineItem(r: any): QuoteLineItem {
  return {
    id: r.id, quoteId: r.quote_id,
    titleZh: r.title_zh ?? '', titleEn: r.title_en ?? '',
    descriptionZh: r.description_zh ?? '', descriptionEn: r.description_en ?? '',
    quantity: r.quantity, unitPrice: r.unit_price, amount: r.amount, type: r.type,
  };
}

function mapContract(r: any): Contract {
  return {
    id: r.id, contractNumber: r.contract_number,
    quoteId: r.quote_id, clientId: r.client_id, templateId: r.template_id,
    projectName: r.project_name, projectDescription: r.project_description,
    serviceScopeZh: r.service_scope_zh ?? '', serviceScopeEn: r.service_scope_en ?? '',
    amount: r.amount, depositAmount: r.deposit_amount, balanceAmount: r.balance_amount,
    status: r.status, contentZh: r.content_zh ?? '', contentEn: r.content_en ?? '',
    publicToken: r.public_token,
    signatureName: r.signature_name, signedAt: r.signed_at, acceptedAt: r.accepted_at,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapContractTemplate(r: any): ContractTemplate {
  return {
    id: r.id, nameZh: r.name_zh, nameEn: r.name_en,
    category: r.category, contentZh: r.content_zh ?? '', contentEn: r.content_en ?? '',
    variables: r.variables ?? [], status: r.status, version: r.version,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapPayment(r: any): Payment {
  return {
    id: r.id, paymentNumber: r.payment_number,
    clientId: r.client_id, quoteId: r.quote_id, contractId: r.contract_id,
    provider: r.provider, amount: r.amount, currency: r.currency, status: r.status,
    paymentMethod: r.payment_method, checkoutUrl: r.checkout_url,
    stripeSessionId: r.stripe_session_id, stripePaymentIntentId: r.stripe_payment_intent_id,
    paidAt: r.paid_at, createdAt: r.created_at,
  };
}

function mapBillingSettings(r: any): BillingSettings {
  return {
    enableStripe: r.enable_stripe, enableManualPayment: r.enable_manual_payment,
    enableEcpay: r.enable_ecpay, enableNewebPay: r.enable_newebpay,
    showInvoiceFields: r.show_invoice_fields, showTaxIdField: r.show_tax_id_field,
    showInvoiceTitleField: r.show_invoice_title_field, showCarrierField: r.show_carrier_field,
    enableReceiptDownload: r.enable_receipt_download,
    enablePaymentProofDownload: r.enable_payment_proof_download,
    enableTaiwanEInvoice: r.enable_taiwan_e_invoice,
    requireBillingInfoBeforePayment: r.require_billing_info_before_payment,
  };
}

function mapSiteSettings(r: any): SiteSettings {
  return {
    studioName: r.studio_name, taglineZh: r.tagline_zh, taglineEn: r.tagline_en,
    email: r.email, phone: r.phone,
    officialLineUrl: r.official_line_url, bookingUrl: r.booking_url,
    socials: r.socials ?? {}, defaultLanguage: r.default_language,
    defaultTheme: r.default_theme, brandColor: r.brand_color,
  };
}

function mapWaitlist(r: any): Waitlist {
  return {
    id: r.id, serviceItemId: r.service_item_id,
    name: r.name, email: r.email, phone: r.phone, lineId: r.line_id,
    message: r.message, status: r.status, createdAt: r.created_at,
  };
}

// ─── Supabase Repository ─────────────────────────────────────────────────────

export class SupabaseRepository {
  private db = assertSupabase();

  // ── Projects ──────────────────────────────────────────────────────────────

  async getProjects(): Promise<Project[]> {
    const { data, error } = await this.db.from('projects').select('*').order('sort_order');
    if (error) throw error;
    return (data ?? []).map(mapProject);
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const { data, error } = await this.db.from('projects').select('*').eq('slug', slug).single();
    if (error) return null;
    return mapProject(data);
  }

  async createProject(p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const { data, error } = await this.db.from('projects').insert({
      id: generateId(), slug: p.slug,
      title_zh: p.titleZh, title_en: p.titleEn, category: p.category,
      description_zh: p.descriptionZh, description_en: p.descriptionEn,
      long_description_zh: p.longDescriptionZh, long_description_en: p.longDescriptionEn,
      tech_stack: p.techStack, features_zh: p.featuresZh, features_en: p.featuresEn,
      status: p.status, is_featured: p.isFeatured, cover_style: p.coverStyle,
      sort_order: p.sortOrder,
      problem_zh: p.problemZh, problem_en: p.problemEn,
      solution_zh: p.solutionZh, solution_en: p.solutionEn,
      result_zh: p.resultZh, result_en: p.resultEn,
    }).select().single();
    if (error) throw error;
    return mapProject(data);
  }

  async updateProject(id: string, p: Partial<Project>): Promise<Project> {
    const updates: any = { updated_at: now() };
    if (p.titleZh !== undefined) updates.title_zh = p.titleZh;
    if (p.titleEn !== undefined) updates.title_en = p.titleEn;
    if (p.descriptionZh !== undefined) updates.description_zh = p.descriptionZh;
    if (p.descriptionEn !== undefined) updates.description_en = p.descriptionEn;
    if (p.longDescriptionZh !== undefined) updates.long_description_zh = p.longDescriptionZh;
    if (p.longDescriptionEn !== undefined) updates.long_description_en = p.longDescriptionEn;
    if (p.techStack !== undefined) updates.tech_stack = p.techStack;
    if (p.featuresZh !== undefined) updates.features_zh = p.featuresZh;
    if (p.featuresEn !== undefined) updates.features_en = p.featuresEn;
    if (p.status !== undefined) updates.status = p.status;
    if (p.isFeatured !== undefined) updates.is_featured = p.isFeatured;
    if (p.coverStyle !== undefined) updates.cover_style = p.coverStyle;
    if (p.sortOrder !== undefined) updates.sort_order = p.sortOrder;
    if (p.category !== undefined) updates.category = p.category;
    if (p.slug !== undefined) updates.slug = p.slug;
    if (p.problemZh !== undefined) updates.problem_zh = p.problemZh;
    if (p.problemEn !== undefined) updates.problem_en = p.problemEn;
    if (p.solutionZh !== undefined) updates.solution_zh = p.solutionZh;
    if (p.solutionEn !== undefined) updates.solution_en = p.solutionEn;
    if (p.resultZh !== undefined) updates.result_zh = p.resultZh;
    if (p.resultEn !== undefined) updates.result_en = p.resultEn;
    const { data, error } = await this.db.from('projects').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return mapProject(data);
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.db.from('projects').delete().eq('id', id);
    if (error) throw error;
  }

  // ── Services ──────────────────────────────────────────────────────────────

  async getServices(): Promise<Service[]> {
    const { data, error } = await this.db.from('services').select('*').order('sort_order');
    if (error) throw error;
    return (data ?? []).map(mapService);
  }

  // alias used by ServicesView
  async getCategories(): Promise<ServiceCategory[]> {
    return this.getServiceCategories();
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    const { data, error } = await this.db.from('service_categories').select('*').order('sort_order');
    if (error) throw error;
    return (data ?? []).map(mapServiceCategory);
  }

  async createService(s: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const { data, error } = await this.db.from('services').insert({
      id: generateId(),
      category_id: s.categoryId, title_zh: s.titleZh, title_en: s.titleEn,
      short_description_zh: s.shortDescriptionZh, short_description_en: s.shortDescriptionEn,
      long_description_zh: s.longDescriptionZh, long_description_en: s.longDescriptionEn,
      deliverables_zh: s.deliverablesZh, deliverables_en: s.deliverablesEn,
      requirements_zh: s.requirementsZh, requirements_en: s.requirementsEn,
      base_price: s.basePrice, currency: s.currency,
      price_label_zh: s.priceLabelZh, price_label_en: s.priceLabelEn,
      billing_type: s.billingType, deposit_percent: s.depositPercent,
      estimated_delivery_days: s.estimatedDeliveryDays, revision_count: s.revisionCount,
      show_price: s.showPrice, is_public: s.isPublic, is_featured: s.isFeatured,
      requires_meeting: s.requiresMeeting, requires_contract: s.requiresContract,
      requires_remote_access: s.requiresRemoteAccess, requires_client_materials: s.requiresClientMaterials,
      related_add_on_ids: s.relatedAddOnIds,
      related_contract_template_id: s.relatedContractTemplateId,
      stripe_price_id: s.stripePriceId, stripe_payment_link: s.stripePaymentLink,
      status: s.status, visibility: s.visibility, availability: s.availability,
      show_on_home: s.showOnHome, show_on_services_page: s.showOnServicesPage,
      show_on_pricing_page: s.showOnPricingPage,
      show_on_start_project_page: s.showOnStartProjectPage,
      show_in_quote_builder: s.showInQuoteBuilder, show_in_admin_only: s.showInAdminOnly,
      allow_direct_checkout: s.allowDirectCheckout, allow_quote_request: s.allowQuoteRequest,
      allow_line_consultation: s.allowLineConsultation, allow_booking: s.allowBooking,
      allow_waitlist: s.allowWaitlist, sort_order: s.sortOrder,
    }).select().single();
    if (error) throw error;
    return mapService(data);
  }

  async updateService(id: string, s: Partial<Service>): Promise<Service> {
    const updates: any = { updated_at: now() };
    const fieldMap: Record<string, string> = {
      categoryId: 'category_id', titleZh: 'title_zh', titleEn: 'title_en',
      shortDescriptionZh: 'short_description_zh', shortDescriptionEn: 'short_description_en',
      longDescriptionZh: 'long_description_zh', longDescriptionEn: 'long_description_en',
      deliverablesZh: 'deliverables_zh', deliverablesEn: 'deliverables_en',
      requirementsZh: 'requirements_zh', requirementsEn: 'requirements_en',
      basePrice: 'base_price', currency: 'currency',
      priceLabelZh: 'price_label_zh', priceLabelEn: 'price_label_en',
      billingType: 'billing_type', depositPercent: 'deposit_percent',
      estimatedDeliveryDays: 'estimated_delivery_days', revisionCount: 'revision_count',
      showPrice: 'show_price', isPublic: 'is_public', isFeatured: 'is_featured',
      status: 'status', visibility: 'visibility', availability: 'availability', sortOrder: 'sort_order',
      requiresMeeting: 'requires_meeting', requiresContract: 'requires_contract',
      requiresRemoteAccess: 'requires_remote_access', requiresClientMaterials: 'requires_client_materials',
      relatedAddOnIds: 'related_add_on_ids', relatedContractTemplateId: 'related_contract_template_id',
      stripePriceId: 'stripe_price_id', stripePaymentLink: 'stripe_payment_link',
      allowDirectCheckout: 'allow_direct_checkout', allowQuoteRequest: 'allow_quote_request',
      allowLineConsultation: 'allow_line_consultation', allowBooking: 'allow_booking',
      allowWaitlist: 'allow_waitlist', showOnHome: 'show_on_home',
      showOnServicesPage: 'show_on_services_page', showOnPricingPage: 'show_on_pricing_page',
      showOnStartProjectPage: 'show_on_start_project_page', showInQuoteBuilder: 'show_in_quote_builder',
      showInAdminOnly: 'show_in_admin_only',
    };
    for (const [key, col] of Object.entries(fieldMap)) {
      if ((s as any)[key] !== undefined) updates[col] = (s as any)[key];
    }
    const { data, error } = await this.db.from('services').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return mapService(data);
  }

  async deleteService(id: string): Promise<void> {
    const { error } = await this.db.from('services').delete().eq('id', id);
    if (error) throw error;
  }

  // ── Pricing Plans ─────────────────────────────────────────────────────────

  async getPricingPlans(): Promise<PricingPlan[]> {
    const { data, error } = await this.db.from('pricing_plans').select('*').order('sort_order');
    if (error) throw error;
    return (data ?? []).map(mapPricingPlan);
  }

  async createPricingPlan(p: Omit<PricingPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingPlan> {
    const { data, error } = await this.db.from('pricing_plans').insert({
      id: generateId(), name_zh: p.nameZh, name_en: p.nameEn,
      description_zh: p.descriptionZh, description_en: p.descriptionEn,
      base_price: p.basePrice, currency: p.currency,
      price_label_zh: p.priceLabelZh, price_label_en: p.priceLabelEn,
      billing_type: p.billingType, deposit_percent: p.depositPercent,
      revision_count: p.revisionCount, estimated_delivery_days: p.estimatedDeliveryDays,
      features_zh: p.featuresZh, features_en: p.featuresEn, add_on_ids: p.addOnIds,
      is_recommended: p.isRecommended, visibility: p.visibility, status: p.status,
      show_on_home: p.showOnHome, show_on_pricing_page: p.showOnPricingPage,
      show_in_quote_builder: p.showInQuoteBuilder, is_featured: p.isFeatured,
      stripe_price_id: p.stripePriceId, stripe_payment_link: p.stripePaymentLink,
      sort_order: p.sortOrder,
    }).select().single();
    if (error) throw error;
    return mapPricingPlan(data);
  }

  async updatePricingPlan(id: string, p: Partial<PricingPlan>): Promise<PricingPlan> {
    const updates: any = { updated_at: now() };
    const fieldMap: Record<string, string> = {
      nameZh: 'name_zh', nameEn: 'name_en',
      descriptionZh: 'description_zh', descriptionEn: 'description_en',
      basePrice: 'base_price', priceLabelZh: 'price_label_zh', priceLabelEn: 'price_label_en',
      billingType: 'billing_type', depositPercent: 'deposit_percent',
      revisionCount: 'revision_count', estimatedDeliveryDays: 'estimated_delivery_days',
      featuresZh: 'features_zh', featuresEn: 'features_en',
      isRecommended: 'is_recommended', visibility: 'visibility', status: 'status',
      showOnHome: 'show_on_home', showOnPricingPage: 'show_on_pricing_page',
      showInQuoteBuilder: 'show_in_quote_builder', isFeatured: 'is_featured',
      addOnIds: 'add_on_ids', stripePriceId: 'stripe_price_id', stripePaymentLink: 'stripe_payment_link', sortOrder: 'sort_order',
    };
    for (const [key, col] of Object.entries(fieldMap)) {
      if ((p as any)[key] !== undefined) updates[col] = (p as any)[key];
    }
    const { data, error } = await this.db.from('pricing_plans').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return mapPricingPlan(data);
  }

  async deletePricingPlan(id: string): Promise<void> {
    const { error } = await this.db.from('pricing_plans').delete().eq('id', id);
    if (error) throw error;
  }

  // ── Add-ons ───────────────────────────────────────────────────────────────

  async getAddOns(): Promise<AddOn[]> {
    const { data, error } = await this.db.from('add_ons').select('*').order('category');
    if (error) throw error;
    return (data ?? []).map(mapAddOn);
  }

  async createAddOn(a: Omit<AddOn, 'id' | 'createdAt' | 'updatedAt'>): Promise<AddOn> {
    const { data, error } = await this.db.from('add_ons').insert({
      id: generateId(), name_zh: a.nameZh, name_en: a.nameEn,
      description_zh: a.descriptionZh, description_en: a.descriptionEn,
      price: a.price, currency: a.currency, unit: a.unit, category: a.category, status: a.status,
    }).select().single();
    if (error) throw error;
    return mapAddOn(data);
  }

  async updateAddOn(id: string, a: Partial<AddOn>): Promise<AddOn> {
    const updates: any = { updated_at: now() };
    if (a.nameZh !== undefined) updates.name_zh = a.nameZh;
    if (a.nameEn !== undefined) updates.name_en = a.nameEn;
    if (a.price !== undefined) updates.price = a.price;
    if (a.status !== undefined) updates.status = a.status;
    const { data, error } = await this.db.from('add_ons').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return mapAddOn(data);
  }

  async deleteAddOn(id: string): Promise<void> {
    const { error } = await this.db.from('add_ons').delete().eq('id', id);
    if (error) throw error;
  }

  // ── Clients ───────────────────────────────────────────────────────────────

  async getClients(): Promise<Client[]> {
    const { data, error } = await this.db.from('clients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapClient);
  }

  async getClientById(id: string): Promise<Client | null> {
    const { data, error } = await this.db.from('clients').select('*').eq('id', id).single();
    if (error) return null;
    return mapClient(data);
  }

  async createClient(c: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const { data, error } = await this.db.from('clients').insert({
      type: c.type, name: c.name, company_name: c.companyName, tax_id: c.taxId,
      contact_name: c.contactName, email: c.email, phone: c.phone,
      line_id: c.lineId, industry: c.industry, source: c.source,
      notes: c.notes, status: c.status,
    }).select().single();
    if (error) throw error;
    return mapClient(data);
  }

  async updateClient(id: string, c: Partial<Client>): Promise<Client> {
    const updates: any = { updated_at: now() };
    if (c.name !== undefined) updates.name = c.name;
    if (c.email !== undefined) updates.email = c.email;
    if (c.phone !== undefined) updates.phone = c.phone;
    if (c.status !== undefined) updates.status = c.status;
    if (c.notes !== undefined) updates.notes = c.notes;
    const { data, error } = await this.db.from('clients').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return mapClient(data);
  }

  // ── Inquiries ─────────────────────────────────────────────────────────────

  async getInquiries(): Promise<Inquiry[]> {
    const { data, error } = await this.db.from('inquiries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapInquiry);
  }

  async createInquiry(i: Omit<Inquiry, 'id' | 'createdAt'>): Promise<Inquiry> {
    const id = crypto.randomUUID();
    const createdAt = now();
    const { error } = await this.db.from('inquiries').insert({
      id, client_id: i.clientId, name: i.name, email: i.email, phone: i.phone,
      line_id: i.lineId, company: i.company, tax_id: i.taxId, industry: i.industry,
      project_type: i.projectType, selected_plan_id: i.selectedPlanId,
      selected_service_ids: i.selectedServiceIds,
      budget_range: i.budgetRange, timeline: i.timeline, message: i.message,
      need_meeting: i.needMeeting, preferred_contact_method: i.preferredContactMethod,
      language_preference: i.languagePreference, invoice_requirement: i.invoiceRequirement,
      status: i.status ?? 'new', created_at: createdAt,
    });
    if (error) throw error;
    return { ...i, id, createdAt };
  }

  async updateInquiryStatus(id: string, status: Inquiry['status']): Promise<void> {
    const { error } = await this.db.from('inquiries').update({ status }).eq('id', id);
    if (error) throw error;
  }

  // ── Quotes ────────────────────────────────────────────────────────────────

  async getQuotes(): Promise<Quote[]> {
    const { data, error } = await this.db.from('quotes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const quotes = data ?? [];
    const result: Quote[] = [];
    for (const q of quotes) {
      const { data: items } = await this.db.from('quote_line_items').select('*').eq('quote_id', q.id);
      result.push(mapQuote(q, (items ?? []).map(mapLineItem)));
    }
    return result;
  }

  async getQuoteByToken(token: string): Promise<Quote | null> {
    const { data, error } = await this.db.from('quotes').select('*').eq('public_token', token).single();
    if (error) return null;
    const { data: items } = await this.db.from('quote_line_items').select('*').eq('quote_id', data.id);
    return mapQuote(data, (items ?? []).map(mapLineItem));
  }

  async createQuote(q: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quote> {
    const { data, error } = await this.db.from('quotes').insert({
      quote_number: q.quoteNumber, client_id: q.clientId,
      selected_plan_id: q.selectedPlanId,
      custom_title_zh: q.customTitleZh, custom_title_en: q.customTitleEn,
      subtotal: q.subtotal, discount: q.discount, tax: q.tax, total: q.total,
      deposit_percent: q.depositPercent, deposit_amount: q.depositAmount,
      balance_amount: q.balanceAmount, valid_until: q.validUntil,
      status: q.status ?? 'draft',
      notes_zh: q.notesZh, notes_en: q.notesEn,
      terms_zh: q.termsZh, terms_en: q.termsEn,
    }).select().single();
    if (error) throw error;

    const lineItems: QuoteLineItem[] = [];
    for (const item of q.lineItems) {
      const { data: li, error: liErr } = await this.db.from('quote_line_items').insert({
        quote_id: data.id, title_zh: item.titleZh, title_en: item.titleEn,
        description_zh: item.descriptionZh, description_en: item.descriptionEn,
        quantity: item.quantity, unit_price: item.unitPrice, amount: item.amount, type: item.type,
      }).select().single();
      if (!liErr && li) lineItems.push(mapLineItem(li));
    }
    return mapQuote(data, lineItems);
  }

  async updateQuoteStatus(id: string, status: Quote['status']): Promise<void> {
    const { error } = await this.db.from('quotes').update({ status, updated_at: now() }).eq('id', id);
    if (error) throw error;
  }

  // ── Contracts ─────────────────────────────────────────────────────────────

  async getContracts(): Promise<Contract[]> {
    const { data, error } = await this.db.from('contracts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapContract);
  }

  async getContractByToken(token: string): Promise<Contract | null> {
    const { data, error } = await this.db.from('contracts').select('*').eq('public_token', token).single();
    if (error) return null;
    return mapContract(data);
  }

  async createContract(c: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    const { data, error } = await this.db.from('contracts').insert({
      contract_number: c.contractNumber, quote_id: c.quoteId, client_id: c.clientId,
      template_id: c.templateId, project_name: c.projectName,
      project_description: c.projectDescription,
      service_scope_zh: c.serviceScopeZh, service_scope_en: c.serviceScopeEn,
      amount: c.amount, deposit_amount: c.depositAmount, balance_amount: c.balanceAmount,
      status: c.status ?? 'draft', content_zh: c.contentZh, content_en: c.contentEn,
    }).select().single();
    if (error) throw error;
    return mapContract(data);
  }

  async signContract(id: string, signatureName: string): Promise<Contract> {
    const { data, error } = await this.db.from('contracts').update({
      signature_name: signatureName,
      signed_at: now(),
      accepted_at: now(),
      status: 'signed',
      updated_at: now(),
    }).eq('id', id).select().single();
    if (error) throw error;
    return mapContract(data);
  }

  async updateContractStatus(id: string, status: Contract['status']): Promise<void> {
    const { error } = await this.db.from('contracts').update({ status, updated_at: now() }).eq('id', id);
    if (error) throw error;
  }

  // ── Contract Templates ────────────────────────────────────────────────────

  async getContractTemplates(): Promise<ContractTemplate[]> {
    const { data, error } = await this.db.from('contract_templates').select('*').order('name_zh');
    if (error) throw error;
    return (data ?? []).map(mapContractTemplate);
  }

  // ── Payments ──────────────────────────────────────────────────────────────

  async getPayments(): Promise<Payment[]> {
    const { data, error } = await this.db.from('payments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapPayment);
  }

  async getPaymentByStripeSession(sessionId: string): Promise<Payment | null> {
    const { data, error } = await this.db.from('payments').select('*').eq('stripe_session_id', sessionId).single();
    if (error) return null;
    return mapPayment(data);
  }

  async createPayment(p: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const { data, error } = await this.db.from('payments').insert({
      payment_number: p.paymentNumber, client_id: p.clientId,
      quote_id: p.quoteId, contract_id: p.contractId,
      provider: p.provider, amount: p.amount, currency: p.currency,
      status: p.status ?? 'pending', checkout_url: p.checkoutUrl,
      stripe_session_id: p.stripeSessionId,
    }).select().single();
    if (error) throw error;
    return mapPayment(data);
  }

  async updatePaymentStatus(id: string, status: Payment['status'], extra?: { paidAt?: string; stripePaymentIntentId?: string }): Promise<void> {
    const updates: any = { status };
    if (extra?.paidAt) updates.paid_at = extra.paidAt;
    if (extra?.stripePaymentIntentId) updates.stripe_payment_intent_id = extra.stripePaymentIntentId;
    const { error } = await this.db.from('payments').update(updates).eq('id', id);
    if (error) throw error;
  }

  // ── Waitlist ──────────────────────────────────────────────────────────────

  async getWaitlist(): Promise<Waitlist[]> {
    const { data, error } = await this.db.from('waitlist').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapWaitlist);
  }

  async createWaitlist(w: Omit<Waitlist, 'id' | 'createdAt'>): Promise<Waitlist> {
    const id = crypto.randomUUID();
    const createdAt = now();
    const { error } = await this.db.from('waitlist').insert({
      id, service_item_id: w.serviceItemId, name: w.name, email: w.email,
      phone: w.phone, line_id: w.lineId, message: w.message, status: 'new', created_at: createdAt,
    });
    if (error) throw error;
    return { ...w, id, status: w.status ?? 'new', createdAt };
  }

  async updateWaitlistStatus(id: string, status: Waitlist['status']): Promise<void> {
    const { error } = await this.db.from('waitlist').update({ status }).eq('id', id);
    if (error) throw error;
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  async getBillingSettings(): Promise<BillingSettings> {
    const { data, error } = await this.db.from('billing_settings').select('*').eq('id', 1).single();
    if (error) throw error;
    return mapBillingSettings(data);
  }

  async updateBillingSettings(s: Partial<BillingSettings>): Promise<BillingSettings> {
    const updates: any = { updated_at: now() };
    const fieldMap: Record<string, string> = {
      enableStripe: 'enable_stripe', enableManualPayment: 'enable_manual_payment',
      showInvoiceFields: 'show_invoice_fields', showTaxIdField: 'show_tax_id_field',
      showInvoiceTitleField: 'show_invoice_title_field', showCarrierField: 'show_carrier_field',
      enableReceiptDownload: 'enable_receipt_download',
      enablePaymentProofDownload: 'enable_payment_proof_download',
      requireBillingInfoBeforePayment: 'require_billing_info_before_payment',
    };
    for (const [key, col] of Object.entries(fieldMap)) {
      if ((s as any)[key] !== undefined) updates[col] = (s as any)[key];
    }
    const { data, error } = await this.db.from('billing_settings').update(updates).eq('id', 1).select().single();
    if (error) throw error;
    return mapBillingSettings(data);
  }

  async getSiteSettings(): Promise<SiteSettings> {
    const { data, error } = await this.db.from('site_settings').select('*').eq('id', 1).single();
    if (error) throw error;
    return mapSiteSettings(data);
  }

  async updateSiteSettings(s: Partial<SiteSettings>): Promise<SiteSettings> {
    const updates: any = { updated_at: now() };
    const fieldMap: Record<string, string> = {
      studioName: 'studio_name', taglineZh: 'tagline_zh', taglineEn: 'tagline_en',
      email: 'email', phone: 'phone',
      officialLineUrl: 'official_line_url', bookingUrl: 'booking_url', socials: 'socials',
      defaultLanguage: 'default_language', defaultTheme: 'default_theme', brandColor: 'brand_color',
    };
    for (const [key, col] of Object.entries(fieldMap)) {
      if ((s as any)[key] !== undefined) updates[col] = (s as any)[key];
    }
    const { data, error } = await this.db.from('site_settings').update(updates).eq('id', 1).select().single();
    if (error) throw error;
    return mapSiteSettings(data);
  }

  // ── Audit Logs ────────────────────────────────────────────────────────────

  async getAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await this.db.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: r.id, actor: r.actor, action: r.action,
      entityType: r.entity_type, entityId: r.entity_id,
      before: r.before, after: r.after, createdAt: r.created_at,
    }));
  }

  // Creates a contract from an accepted quote (mirrors LocalStorage behaviour)
  async createContractFromQuote(quote: Quote): Promise<Contract> {
    const contractNumber = `CON-${Date.now()}`;
    return this.createContract({
      contractNumber,
      quoteId: quote.id,
      clientId: quote.clientId,
      templateId: 'tmpl-web',
      projectName: quote.customTitleZh || quote.customTitleEn || 'New Project',
      projectDescription: '',
      serviceScopeZh: quote.notesZh || '',
      serviceScopeEn: quote.notesEn || '',
      amount: quote.total,
      depositAmount: quote.depositAmount,
      balanceAmount: quote.balanceAmount,
      status: 'draft',
      contentZh: '',
      contentEn: '',
      publicToken: Math.random().toString(36).substring(2),
    });
  }

  async createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
    await this.db.from('audit_logs').insert({
      actor: log.actor, action: log.action,
      entity_type: log.entityType, entity_id: log.entityId,
      before: log.before, after: log.after,
    });
  }
}
