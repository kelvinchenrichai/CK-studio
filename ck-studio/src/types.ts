/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectCoverStyle = 'purple-glow' | 'emerald-grid' | 'blue-nodes' | 'titanium-metal' | 'sunset-orange';

export interface Project {
  id: string;
  slug: string;
  titleZh: string;
  titleEn: string;
  category: string;
  descriptionZh: string;
  descriptionEn: string;
  longDescriptionZh: string;
  longDescriptionEn: string;
  techStack: string[];
  featuresZh: string[];
  featuresEn: string[];
  status: 'active' | 'coming_soon' | 'beta' | 'internal' | 'paused' | 'archived';
  isFeatured: boolean;
  coverStyle: ProjectCoverStyle;
  sortOrder: number;
  problemZh?: string;
  problemEn?: string;
  solutionZh?: string;
  solutionEn?: string;
  resultZh?: string;
  resultEn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  titleZh: string;
  titleEn: string;
  shortDescriptionZh: string;
  shortDescriptionEn: string;
  longDescriptionZh: string;
  longDescriptionEn: string;
  deliverablesZh: string[];
  deliverablesEn: string[];
  requirementsZh: string[];
  requirementsEn: string[];
  basePrice: number;
  currency: string;
  priceLabelZh: string;
  priceLabelEn: string;
  billingType: 'fixed' | 'starting_from' | 'hourly' | 'monthly' | 'yearly' | 'custom_quote';
  depositPercent: number;
  estimatedDeliveryDays: number;
  revisionCount: number;
  isPublic: boolean;
  isFeatured: boolean;
  requiresMeeting: boolean;
  requiresContract: boolean;
  requiresRemoteAccess: boolean;
  requiresClientMaterials: boolean;
  relatedAddOnIds: string[];
  relatedContractTemplateId: string;
  stripePriceId: string;
  stripePaymentLink: string;
  status: 'draft' | 'active' | 'hidden' | 'archived' | 'coming_soon' | 'beta' | 'internal' | 'paused';
  visibility: 'public' | 'hidden' | 'private';
  availability: 'available_now' | 'consultation_required' | 'waitlist' | 'not_available';
  showOnHome: boolean;
  showOnServicesPage: boolean;
  showOnPricingPage: boolean;
  showOnStartProjectPage: boolean;
  showInQuoteBuilder: boolean;
  showInAdminOnly: boolean;
  allowDirectCheckout: boolean;
  allowQuoteRequest: boolean;
  allowLineConsultation: boolean;
  allowBooking: boolean;
  allowWaitlist: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  isPublic: boolean;
  sortOrder: number;
  iconName: string; // e.g. 'TrendingUp', 'Bot', 'Cpu'
}

export interface PricingPlan {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  basePrice: number;
  currency: string;
  priceLabelZh: string;
  priceLabelEn: string;
  billingType: 'one-time' | 'monthly' | 'yearly' | 'milestone';
  depositPercent: number;
  revisionCount: number;
  estimatedDeliveryDays: number;
  featuresZh: string[];
  featuresEn: string[];
  addOnIds: string[];
  isRecommended: boolean;
  visibility: 'public' | 'hidden' | 'private';
  status: 'active' | 'coming_soon' | 'beta' | 'internal' | 'paused' | 'archived';
  showOnHome: boolean;
  showOnPricingPage: boolean;
  showInQuoteBuilder: boolean;
  isFeatured: boolean;
  stripePriceId: string;
  stripePaymentLink: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddOn {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  price: number;
  currency: string;
  unit: string; // e.g., 'page', 'month', 'flat'
  category: string;
  status: 'active' | 'hidden' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  type: 'individual' | 'company';
  name: string;
  companyName?: string;
  taxId?: string;
  contactName: string;
  email: string;
  phone: string;
  lineId: string;
  industry: string;
  source?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  clientId?: string;
  name: string;
  email: string;
  phone: string;
  lineId: string;
  company?: string;
  taxId?: string;
  industry: string;
  projectType: string;
  selectedPlanId?: string;
  selectedServiceIds?: string[];
  budgetRange: string;
  timeline: string;
  message: string;
  needMeeting: boolean;
  preferredContactMethod: 'LINE' | 'Email' | 'Phone';
  languagePreference: 'zh' | 'en';
  invoiceRequirement: boolean;
  status: 'new' | 'contacted' | 'invited' | 'closed';
  createdAt: string;
}

export interface QuoteLineItem {
  id: string;
  quoteId: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  type: 'service' | 'addon' | 'discount' | 'custom';
}

export interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  selectedPlanId?: string;
  customTitleZh: string;
  customTitleEn: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  depositPercent: number;
  depositAmount: number;
  balanceAmount: number;
  validUntil: string;
  publicToken: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted_to_contract';
  notesZh: string;
  notesEn: string;
  termsZh: string;
  termsEn: string;
  lineItems: QuoteLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  quoteId: string;
  clientId: string;
  templateId: string;
  projectName: string;
  projectDescription?: string;
  serviceScopeZh: string;
  serviceScopeEn: string;
  amount: number;
  depositAmount: number;
  balanceAmount: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'signed' | 'deposit_paid' | 'paid' | 'active' | 'completed' | 'cancelled';
  contentZh: string;
  contentEn: string;
  publicToken: string;
  signatureName?: string;
  signedAt?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractTemplate {
  id: string;
  nameZh: string;
  nameEn: string;
  category: string;
  contentZh: string;
  contentEn: string;
  variables: string[];
  status: 'active' | 'inactive';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  clientId: string;
  quoteId?: string;
  contractId?: string;
  provider: 'stripe' | 'manual' | 'ecpay' | 'newebpay';
  amount: number;
  currency: string;
  status: 'pending' | 'checkout_created' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  checkoutUrl?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface BillingSettings {
  enableStripe: boolean;
  enableManualPayment: boolean;
  enableEcpay: boolean;
  enableNewebPay: boolean;
  showInvoiceFields: boolean;
  showTaxIdField: boolean;
  showInvoiceTitleField: boolean;
  showCarrierField: boolean;
  enableReceiptDownload: boolean;
  enablePaymentProofDownload: boolean;
  enableTaiwanEInvoice: boolean;
  requireBillingInfoBeforePayment: boolean;
}

export interface SiteSettings {
  studioName: string;
  taglineZh: string;
  taglineEn: string;
  email: string;
  phone: string;
  officialLineUrl: string;
  bookingUrl: string;
  socials: {
    github?: string;
    twitter?: string;
  };
  defaultLanguage: 'zh' | 'en';
  defaultTheme: 'dark' | 'light';
  brandColor: string;
}

export interface Waitlist {
  id: string;
  serviceItemId: string;
  name: string;
  email: string;
  phone: string;
  lineId: string;
  message?: string;
  status: 'new' | 'contacted' | 'invited' | 'closed';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
  createdAt: string;
}
