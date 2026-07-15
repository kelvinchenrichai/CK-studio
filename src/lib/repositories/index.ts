/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Project,
  Service,
  ServiceCategory,
  PricingPlan,
  AddOn,
  Client,
  Inquiry,
  Quote,
  QuoteLineItem,
  Contract,
  ContractTemplate,
  Payment,
  BillingSettings,
  SiteSettings,
  Waitlist,
  AuditLog,
  PublicWorkspace
} from '../../types';
import { renderContractTemplate } from '../contracts';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// INITIAL SEED DATA
const defaultCategories: ServiceCategory[] = [
  {
    id: 'ai-dev',
    nameZh: 'AI 系統研發',
    nameEn: 'AI Development',
    descriptionZh: '客製化 LLM 整合、AI Agent 部署與長上下文自動化研究',
    descriptionEn: 'Custom LLM integrations, AI Agent deployment, and long-context automations.',
    isPublic: true,
    sortOrder: 1,
    iconName: 'Cpu'
  },
  {
    id: 'trading-solutions',
    nameZh: '交易決策智能',
    nameEn: 'Trading Solutions',
    descriptionZh: 'TradingView Pine Script 開發、CME PG40 籌碼分析與風控系統',
    descriptionEn: 'TradingView Pine Script suites, CME PG40 analysis, and prop risk controls.',
    isPublic: true,
    sortOrder: 2,
    iconName: 'TrendingUp'
  },
  {
    id: 'web-dev',
    nameZh: '高質感網頁開發',
    nameEn: 'Web Development',
    descriptionZh: 'Next.js / React 品牌官網、Landing Page 與高轉換 CMS 系統',
    descriptionEn: 'Next.js / React brand sites, high-converting Landing Pages, and premium CMS.',
    isPublic: true,
    sortOrder: 3,
    iconName: 'Globe'
  },
  {
    id: 'automation',
    nameZh: '自動化工作流',
    nameEn: 'Automation',
    descriptionZh: 'n8n 自動化、LINE OA 機器人、瀏覽器 Playwright 無人化操作',
    descriptionEn: 'n8n automations, LINE OA bots, and Playwright browser robotic workflows.',
    isPublic: true,
    sortOrder: 4,
    iconName: 'Activity'
  },
  {
    id: 'business-systems',
    nameZh: '企業營運系統',
    nameEn: 'Business Systems',
    descriptionZh: 'ezPretty 預約系統整合、儲值/返利機制與客製後台管理系統',
    descriptionEn: 'ezPretty system integrations, store recharges/rebates, and customized CRMs.',
    isPublic: true,
    sortOrder: 5,
    iconName: 'Sliders'
  },
  {
    id: 'remote-setup',
    nameZh: '遠端技術部署',
    nameEn: 'Remote Setup',
    descriptionZh: '小龍蝦/OpenClaw 設定、本地 AI Agent 執行環境遠端安裝',
    descriptionEn: 'OpenClaw setup, local AI Agent runtimes, and secure remote installation.',
    isPublic: true,
    sortOrder: 6,
    iconName: 'Terminal'
  },
  {
    id: 'consulting',
    nameZh: '技術顧問諮詢',
    nameEn: 'Consulting',
    descriptionZh: '一對一技術可行性對接、系統架構設計與顧問週會',
    descriptionEn: 'One-on-one feasibility analysis, system architecture design, and advisory calls.',
    isPublic: true,
    sortOrder: 7,
    iconName: 'MessageSquare'
  },
  {
    id: 'maintenance',
    nameZh: '系統運行維護',
    nameEn: 'Maintenance',
    descriptionZh: '定時錯誤修復、API 更新、伺服器監控與微調保固',
    descriptionEn: 'Regular bug patching, API updates, server monitoring, and warranty support.',
    isPublic: false,
    sortOrder: 8,
    iconName: 'Shield'
  }
];

const defaultServices: Service[] = [
  {
    id: 'srv-tv-indicator',
    categoryId: 'trading-solutions',
    titleZh: 'TradingView Pine Script 指標開發',
    titleEn: 'TradingView Pine Script Indicator Development',
    shortDescriptionZh: '為交易員客製 TradingView 指標、策略、Alert 與 Webhook，自動化盤中提醒與交易流程。',
    shortDescriptionEn: 'Custom TradingView indicators, strategies, alerts, and webhook workflows for traders.',
    longDescriptionZh: '針對您的交易策略與邏輯，利用 Pine Script v6 進行高效率的指標撰寫。支援 ORB 區間、VWAP/MA 趨勢濾網、CVD / Volume Profile 籌碼量化分析，並能整合外部 Webhook 發送警報至 LINE 或 Telegram 機制。',
    longDescriptionEn: 'Bespoke indicator script engineering in Pine Script v6. We build robust systems for GEX levels, ORB range trackers, custom volume profiles, CVD accumulators, and trigger external hooks (LINE, Telegram, Discord, server APIs).',
    deliverablesZh: ['Pine Script 原始碼 (.txt / TradingView 存檔)', '指標參數說明文件 (中/英文)', 'Webhook 警報串接設定指南'],
    deliverablesEn: ['Pine Script source code (.txt / direct TradingView publish)', 'Parameter usage documentation', 'Webhook alerting setup manual'],
    requirementsZh: ['明確的進出場訊號邏輯 (文字或截圖)', '指標所依賴的底層數據源說明', '警報接收端 (如 LINE OA) 的 Webhook URL'],
    requirementsEn: ['Clear entry/exit trading rules with diagrams', 'Required indicator datasets or baseline variables', 'Webhook endpoint destination token'],
    basePrice: 12000,
    currency: 'TWD',
    priceLabelZh: 'NT$ 12,000 起',
    priceLabelEn: 'Starting from NT$ 12,000',
    billingType: 'starting_from',
    depositPercent: 50,
    estimatedDeliveryDays: 5,
    revisionCount: 2,
    showPrice: true,
    isPublic: true,
    isFeatured: true,
    requiresMeeting: true,
    requiresContract: true,
    requiresRemoteAccess: false,
    requiresClientMaterials: true,
    relatedAddOnIds: ['add-emergency', 'add-maint'],
    relatedContractTemplateId: 'tmpl-tv',
    stripePriceId: 'price_mock_tv_indicator',
    stripePaymentLink: '',
    status: 'active',
    visibility: 'public',
    availability: 'consultation_required',
    showOnHome: true,
    showOnServicesPage: true,
    showOnPricingPage: true,
    showOnStartProjectPage: true,
    showInQuoteBuilder: true,
    showInAdminOnly: false,
    allowDirectCheckout: false,
    allowQuoteRequest: true,
    allowLineConsultation: true,
    allowBooking: true,
    allowWaitlist: false,
    sortOrder: 1,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'srv-tv-backtest',
    categoryId: 'trading-solutions',
    titleZh: 'TradingView 策略回測開發',
    titleEn: 'TradingView Strategy Backtest Development',
    shortDescriptionZh: '將交易邏輯轉換為 Pine Script 回測策略，包含進出場條件、停損停利、風控參數與績效統計。',
    shortDescriptionEn: 'Turn trading logic into Pine Script backtesting strategies with entries, exits, risk parameters, and performance metrics.',
    longDescriptionZh: '將特定的量化買賣想法轉換為 TradingView 官方可回測的 Strategy 結構。內建保本單（Breakeven）、移動停損（Trailing Stop）、Prop Firm 的每日回撤上限防護等風控模組，並產出清晰的報表與交易清單。',
    longDescriptionEn: 'Formulate qualitative discretionary methods into backtest-ready Pine Script Strategies. Incorporates breakeven steps, trailing exits, maximum daily drawdown limit guards, and custom CSV backup metrics.',
    deliverablesZh: ['TradingView 策略源碼', '參數最佳化區間報告', '風控防範模組模版'],
    deliverablesEn: ['Backtesting strategy Pine code', 'Optimization parameter guide', 'Risk control blueprint'],
    requirementsZh: ['交易策略詳細邏輯 (包含停損、停利、加碼規則)', '欲回測的商品與時間級別'],
    requirementsEn: ['Detailed step-by-step sizing, stop-loss, take-profit, and re-entry rules', 'Target assets and specific timeframe parameters'],
    basePrice: 18000,
    currency: 'TWD',
    priceLabelZh: 'NT$ 18,000 起',
    priceLabelEn: 'Starting from NT$ 18,000',
    billingType: 'starting_from',
    depositPercent: 50,
    estimatedDeliveryDays: 7,
    revisionCount: 2,
    showPrice: true,
    isPublic: true,
    isFeatured: false,
    requiresMeeting: true,
    requiresContract: true,
    requiresRemoteAccess: false,
    requiresClientMaterials: false,
    relatedAddOnIds: ['add-maint'],
    relatedContractTemplateId: 'tmpl-tv',
    stripePriceId: 'price_mock_tv_backtest',
    stripePaymentLink: '',
    status: 'active',
    visibility: 'public',
    availability: 'consultation_required',
    showOnHome: false,
    showOnServicesPage: true,
    showOnPricingPage: true,
    showOnStartProjectPage: true,
    showInQuoteBuilder: true,
    showInAdminOnly: false,
    allowDirectCheckout: false,
    allowQuoteRequest: true,
    allowLineConsultation: true,
    allowBooking: true,
    allowWaitlist: false,
    sortOrder: 2,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'srv-ai-setup',
    categoryId: 'remote-setup',
    titleZh: 'AI Agent 遠端安裝設定',
    titleEn: 'AI Agent Remote Setup',
    shortDescriptionZh: '協助客戶遠端安裝與設定 AI Agent、自動化工具、瀏覽器控制工具與基礎工作流。',
    shortDescriptionEn: 'Remote setup for AI agents, automation tools, browser-control tools, and basic workflows.',
    longDescriptionZh: '針對企業或個人用戶，協助於本機、VPS 或是雲端主機遠端部署先進的開源 AI Agent 架構。協助設定 API 金鑰、本機知識庫、多模態感知與排程，讓您體驗一鍵式的背景 AI 自動化代理。',
    longDescriptionEn: 'Deploy open-source autonomous AI agent templates onto your workstation, cloud VPS, or private server. Includes API credential routing, custom vectorized document retrieval setups, and structured system cron triggers.',
    deliverablesZh: ['專屬執行環境安裝檔/指令包', '遠端連線安全報告', 'AI 指令範例與對話手冊'],
    deliverablesEn: ['System scripts and executable package configurations', 'Security and credentials connection summary', 'Command prompt usage cheat sheet'],
    requirementsZh: ['合規的作業系統環境 (Windows 11 / Ubuntu / macOS)', '合法的 API 憑證 (如 OpenAI / Gemini)', '安裝必備的 AnyDesk / TeamViewer 等遠端通道'],
    requirementsEn: ['Supported base OS (macOS, Ubuntu, or Windows 11)', 'API Keys (e.g. Gemini, OpenAI, Anthropic)', 'Secure remote workspace viewer access (AnyDesk/TeamViewer)'],
    basePrice: 5000,
    currency: 'TWD',
    priceLabelZh: 'NT$ 5,000 起',
    priceLabelEn: 'Starting from NT$ 5,000',
    billingType: 'starting_from',
    depositPercent: 50,
    estimatedDeliveryDays: 3,
    revisionCount: 1,
    showPrice: true,
    isPublic: true,
    isFeatured: true,
    requiresMeeting: true,
    requiresContract: true,
    requiresRemoteAccess: true,
    requiresClientMaterials: true,
    relatedAddOnIds: ['add-emergency'],
    relatedContractTemplateId: 'tmpl-maintenance',
    stripePriceId: 'price_mock_ai_setup',
    stripePaymentLink: '',
    status: 'beta',
    visibility: 'public',
    availability: 'consultation_required',
    showOnHome: true,
    showOnServicesPage: true,
    showOnPricingPage: true,
    showOnStartProjectPage: true,
    showInQuoteBuilder: true,
    showInAdminOnly: false,
    allowDirectCheckout: false,
    allowQuoteRequest: true,
    allowLineConsultation: true,
    allowBooking: true,
    allowWaitlist: false,
    sortOrder: 3,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'srv-openclaw-setup',
    categoryId: 'remote-setup',
    titleZh: '小龍蝦 / OpenClaw / 本地 Agent 遠端設定',
    titleEn: 'OpenClaw / Local Agent Remote Setup',
    shortDescriptionZh: '協助客戶設定本地 AI Agent、Browser Automation、Playwright 或類似工具，建立初步可用的自動化流程。',
    shortDescriptionEn: 'Remote setup for local AI agents, browser automation, Playwright, or similar tools.',
    longDescriptionZh: '【即將推出】專為網頁自動操作設計。設定 OpenClaw 或 Playwright 網頁爬取及無人自動填表機制，將手動、機械式的重複作業轉變為 24 小時不間斷運作的軟體機器人。',
    longDescriptionEn: '【Coming Soon】Streamline tedious manual browser actions using OpenClaw, Playwright scripts, and intelligent local agent workflows. Runs headless 24/7 on local machines or background micro-servers.',
    deliverablesZh: ['等待名單通知與優先部署資格', '基礎瀏覽器自動化指令碼封裝'],
    deliverablesEn: ['Waitlist priority access slot', 'Pre-release browser script template files'],
    requirementsZh: ['提供欲自動化操作的網頁目標說明', '登記加入 Waitlist'],
    requirementsEn: ['Description of targeted web pages and flow patterns', 'Submit contact details to register on the waitlist'],
    basePrice: 8000,
    currency: 'TWD',
    priceLabelZh: 'NT$ 8,000 起',
    priceLabelEn: 'Starting from NT$ 8,000',
    billingType: 'starting_from',
    depositPercent: 50,
    estimatedDeliveryDays: 4,
    revisionCount: 1,
    showPrice: true,
    isPublic: true,
    isFeatured: false,
    requiresMeeting: false,
    requiresContract: false,
    requiresRemoteAccess: true,
    requiresClientMaterials: true,
    relatedAddOnIds: [],
    relatedContractTemplateId: 'tmpl-maintenance',
    stripePriceId: 'price_mock_openclaw',
    stripePaymentLink: '',
    status: 'coming_soon',
    visibility: 'public',
    availability: 'waitlist',
    showOnHome: true,
    showOnServicesPage: true,
    showOnPricingPage: false,
    showOnStartProjectPage: true,
    showInQuoteBuilder: true,
    showInAdminOnly: false,
    allowDirectCheckout: false,
    allowQuoteRequest: false,
    allowLineConsultation: true,
    allowBooking: false,
    allowWaitlist: true,
    sortOrder: 4,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'srv-n8n-workflow',
    categoryId: 'automation',
    titleZh: 'n8n 自動化流程建置',
    titleEn: 'n8n Automation Workflow',
    shortDescriptionZh: '建立表單、Webhook、Google Sheet、Gmail、LINE、Telegram、AI API 等自動化流程。',
    shortDescriptionEn: 'Build automation workflows with forms, webhooks, Google Sheets, Gmail, LINE, Telegram, and AI APIs.',
    longDescriptionZh: '利用頂尖工作流工具 n8n，在多個平台（Gmail, Sheets, Calendars, Airtable, Notion）與通訊軟體（LINE / Telegram / Email）之間，建立無縫的 API webhook 呼叫機制，實現無人維護、全天候自動同步。',
    longDescriptionEn: 'Build interconnected node workflows utilizing n8n cloud or local. Triggers actions dynamically based on custom HTML Forms, database inserts, calendar hooks, or direct AI summarizations of files.',
    deliverablesZh: ['n8n 工作流 JSON 匯出檔', 'Webhook 安全權限設定指導', '連線異常警報設定'],
    deliverablesEn: ['n8n Workflow JSON export bundle', 'API secret credential handling structure', 'Alert nodes config for system crashes'],
    requirementsZh: ['所需要串接的第三方平台帳密與 API 金鑰', '詳細的資料流向、同步規則'],
    requirementsEn: ['Credentials & API accesses for integrated applications', 'Explicit sequential data synchronization blueprints'],
    basePrice: 15000,
    currency: 'TWD',
    priceLabelZh: 'NT$ 15,000 起',
    priceLabelEn: 'Starting from NT$ 15,000',
    billingType: 'starting_from',
    depositPercent: 50,
    estimatedDeliveryDays: 6,
    revisionCount: 2,
    showPrice: true,
    isPublic: true,
    isFeatured: true,
    requiresMeeting: true,
    requiresContract: true,
    requiresRemoteAccess: false,
    requiresClientMaterials: true,
    relatedAddOnIds: ['add-emergency', 'add-maint'],
    relatedContractTemplateId: 'tmpl-web',
    stripePriceId: 'price_mock_n8n',
    stripePaymentLink: '',
    status: 'active',
    visibility: 'public',
    availability: 'consultation_required',
    showOnHome: true,
    showOnServicesPage: true,
    showOnPricingPage: true,
    showOnStartProjectPage: true,
    showInQuoteBuilder: true,
    showInAdminOnly: false,
    allowDirectCheckout: false,
    allowQuoteRequest: true,
    allowLineConsultation: true,
    allowBooking: true,
    allowWaitlist: false,
    sortOrder: 5,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'srv-line-oa-setup',
    categoryId: 'automation',
    titleZh: 'LINE OA 自動化設定',
    titleEn: 'LINE OA Automation Setup',
    shortDescriptionZh: '協助設定 LINE 官方帳號、自動回覆、表單串接、客戶資料收集與通知流程。',
    shortDescriptionEn: 'Setup LINE Official Account automation, auto-replies, forms, lead collection, and notification workflows.',
    longDescriptionZh: '將您的 LINE 官方帳號升級為強大的 CRM 工具。支援歡迎詞自訂、圖文選單、關鍵字自動客服、問卷表單搜集，並串接至後台試算表，有新詢問時立刻發送推播通知，極大化諮詢轉換率。',
    longDescriptionEn: 'Elevate your traditional LINE business account into an intelligent conversational CRM. Configure custom rich menus, responsive keyword auto-responders, on-line customer intake forms, and background push triggers.',
    deliverablesZh: ['LINE OA 管理權限與選單設計', '自動回覆語句 SOP', '客戶資料自動同步 Sheet 流程'],
    deliverablesEn: ['LINE OA layout design assets & webhook setups', 'Standard keyword mapping tables & script configs', 'Intake database connectors to central spreadsheets'],
    requirementsZh: ['認證/未認證的 LINE 官方帳號管理員權限', '品牌基礎視覺與配色需求'],
    requirementsEn: ['Administrator permission on the destination LINE Official Account', 'Brand primary colors and logo assets'],
    basePrice: 15000,
    currency: 'TWD',
    priceLabelZh: 'NT$ 15,000 起',
    priceLabelEn: 'Starting from NT$ 15,000',
    billingType: 'starting_from',
    depositPercent: 50,
    estimatedDeliveryDays: 5,
    revisionCount: 2,
    showPrice: true,
    isPublic: true,
    isFeatured: false,
    requiresMeeting: true,
    requiresContract: true,
    requiresRemoteAccess: false,
    requiresClientMaterials: true,
    relatedAddOnIds: ['add-emergency'],
    relatedContractTemplateId: 'tmpl-web',
    stripePriceId: 'price_mock_line_oa',
    stripePaymentLink: '',
    status: 'active',
    visibility: 'public',
    availability: 'consultation_required',
    showOnHome: false,
    showOnServicesPage: true,
    showOnPricingPage: true,
    showOnStartProjectPage: true,
    showInQuoteBuilder: true,
    showInAdminOnly: false,
    allowDirectCheckout: false,
    allowQuoteRequest: true,
    allowLineConsultation: true,
    allowBooking: true,
    allowWaitlist: false,
    sortOrder: 6,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'srv-web-landing',
    categoryId: 'web-dev',
    titleZh: '高質感 Landing Page 建置',
    titleEn: 'Premium Landing Page Development',
    shortDescriptionZh: '為個人品牌、商家或服務打造高質感響應式 Landing Page。',
    shortDescriptionEn: 'Premium responsive landing page for personal brands, businesses, or service-based offers.',
    longDescriptionZh: '使用現代框架 Next.js / Tailwind CSS / Motion 打造精緻的單頁品牌形象或高轉換銷售頁。著重微交互細節、極速載入體驗、完美的 RWD 手機板自適應，並完整支援 SEO 架構優化與聯絡表單。',
    longDescriptionEn: 'Engineered using top-tier technologies (Next.js, Tailwind CSS, motion). We craft responsive single-page landing layouts geared toward extreme fast loads, pristine layout density, smooth entries, and integrated capture systems.',
    deliverablesZh: ['原始程式碼庫 (Github)', '一鍵部署 Vercel/Cloud Run 設定', '整合式聯絡表單發信設定'],
    deliverablesEn: ['Source code repository access', 'Vercel or Cloud Run instant server setup', 'Interactive lead capture forms routing'],
    requirementsZh: ['品牌 LOGO 與高解析度產品/人物素材', '中英文銷售文案/文檔 (我們可提供架構指引)', '專屬網域 dns 設定權限 (若需上線)'],
    requirementsEn: ['Brand logo & high-resolution digital media', 'Copywriting or standard outline structures', 'Domain nameserver mapping access'],
    basePrice: 28000,
    currency: 'TWD',
    priceLabelZh: 'NT$ 28,000 起',
    priceLabelEn: 'Starting from NT$ 28,000',
    billingType: 'starting_from',
    depositPercent: 50,
    estimatedDeliveryDays: 8,
    revisionCount: 2,
    showPrice: true,
    isPublic: true,
    isFeatured: true,
    requiresMeeting: true,
    requiresContract: true,
    requiresRemoteAccess: false,
    requiresClientMaterials: false,
    relatedAddOnIds: ['add-seo', 'add-page', 'add-maint'],
    relatedContractTemplateId: 'tmpl-web',
    stripePriceId: 'price_mock_web_landing',
    stripePaymentLink: '',
    status: 'active',
    visibility: 'public',
    availability: 'available_now',
    showOnHome: true,
    showOnServicesPage: true,
    showOnPricingPage: true,
    showOnStartProjectPage: true,
    showInQuoteBuilder: true,
    showInAdminOnly: false,
    allowDirectCheckout: false,
    allowQuoteRequest: true,
    allowLineConsultation: true,
    allowBooking: true,
    allowWaitlist: false,
    sortOrder: 7,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'srv-ezpretty',
    categoryId: 'business-systems',
    titleZh: 'ezPretty 預約系統整合顧問',
    titleEn: 'ezPretty Integration Consulting',
    shortDescriptionZh: '協助店家規劃 ezPretty 預約系統、會員、儲值、返點、返利與客製官網整合方案。',
    shortDescriptionEn: 'Consulting for ezPretty booking system integration, membership, recharge, rebate, cashback, and custom website workflows.',
    longDescriptionZh: '針對美容、美髮、醫美、健身等已導入或計畫導入 ezPretty 預約系統的實體店家。我們提供深度的 API / iframe / 外部預約入口整合方案，並規劃儲值卡與 LINE 官方帳號的自動返點與業績提成系統。',
    longDescriptionEn: 'Tailored for storefront owners adopting ezPretty. We engineer bespoke API middlewares, embed custom interactive frames, layout user-friendly reward tiers, and set up dynamic membership cashback alerts.',
    deliverablesZh: ['預約整合系統架構圖', 'ezPretty 連接 API 測試報表', 'LINE 儲值與返點流程規劃書'],
    deliverablesEn: ['Integration architectural wireframe blueprint', 'ezPretty API staging pipeline checks', 'LINE membership points flow planning manual'],
    requirementsZh: ['ezPretty 店家管理權限或合作夥伴 API Key', '現有的品牌官網技術權限說明'],
    requirementsEn: ['ezPretty store account credentials or API portal key', 'Existing brand website technical specification overview'],
    basePrice: 0,
    currency: 'TWD',
    priceLabelZh: '客製報價',
    priceLabelEn: 'Custom Quote',
    billingType: 'custom_quote',
    depositPercent: 40,
    estimatedDeliveryDays: 14,
    revisionCount: 3,
    showPrice: true,
    isPublic: true,
    isFeatured: true,
    requiresMeeting: true,
    requiresContract: true,
    requiresRemoteAccess: false,
    requiresClientMaterials: true,
    relatedAddOnIds: ['add-payment', 'add-maint'],
    relatedContractTemplateId: 'tmpl-ezpretty',
    stripePriceId: '',
    stripePaymentLink: '',
    status: 'active',
    visibility: 'public',
    availability: 'consultation_required',
    showOnHome: true,
    showOnServicesPage: true,
    showOnPricingPage: true,
    showOnStartProjectPage: true,
    showInQuoteBuilder: true,
    showInAdminOnly: false,
    allowDirectCheckout: false,
    allowQuoteRequest: true,
    allowLineConsultation: true,
    allowBooking: true,
    allowWaitlist: false,
    sortOrder: 8,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'srv-consulting-session',
    categoryId: 'consulting',
    titleZh: '技術顧問諮詢',
    titleEn: 'Technical Consulting Session',
    shortDescriptionZh: '針對 AI、自動化、交易工具、網站、系統開發需求，提供一對一技術諮詢。',
    shortDescriptionEn: 'One-on-one consulting for AI, automation, trading tools, websites, and system development.',
    longDescriptionZh: '快速對接與解惑。提供 1 小時線上一對一技術探討會議。我們將深入評估您的架構可行性、Pine Script 撰寫盲點、n8n 自動化流程瓶頸，並於會後提供完整的架構規劃建議書與錄影檔。',
    longDescriptionEn: 'Direct access to solve engineering bottlenecks. Enjoy 1 full hour of personal digital architecture alignment. Covers code review of Pine Script, diagnostics of n8n loops, and post-session architecture summaries.',
    deliverablesZh: ['1 小時錄影會議紀錄存檔', '技術可行性架構與工具推薦清單 (PDF)'],
    deliverablesEn: ['1-hour private session video recording file', 'Technical architectural recommendations & tools summary PDF'],
    requirementsZh: ['會前提早提供欲探討的主題或現有程式碼片段'],
    requirementsEn: ['Submit core topics or brief buggy code fragments ahead of the session'],
    basePrice: 2500,
    currency: 'TWD',
    priceLabelZh: 'NT$ 2,500 / 小時',
    priceLabelEn: 'NT$ 2,500 / hr',
    billingType: 'hourly',
    depositPercent: 100,
    estimatedDeliveryDays: 1,
    revisionCount: 0,
    showPrice: true,
    isPublic: true,
    isFeatured: false,
    requiresMeeting: true,
    requiresContract: false,
    requiresRemoteAccess: false,
    requiresClientMaterials: false,
    relatedAddOnIds: [],
    relatedContractTemplateId: 'tmpl-maintenance',
    stripePriceId: 'price_mock_consulting',
    stripePaymentLink: '',
    status: 'active',
    visibility: 'public',
    availability: 'available_now',
    showOnHome: false,
    showOnServicesPage: true,
    showOnPricingPage: true,
    showOnStartProjectPage: true,
    showInQuoteBuilder: true,
    showInAdminOnly: false,
    allowDirectCheckout: true,
    allowQuoteRequest: false,
    allowLineConsultation: true,
    allowBooking: true,
    allowWaitlist: false,
    sortOrder: 9,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'srv-maintenance',
    categoryId: 'maintenance',
    titleZh: '系統維護月費',
    titleEn: 'Monthly Maintenance',
    shortDescriptionZh: '提供網站、系統、自動化流程的基礎維護、錯誤修復與小幅調整。',
    shortDescriptionEn: 'Monthly maintenance for websites, systems, and automation workflows, including bug fixes and small adjustments.',
    longDescriptionZh: '為已上線專案提供穩定運行保固。包含月度伺服器監控、API 版本修復、定時備份、緊急故障排除與每月最多 3 小時的排版及內容小幅調整。',
    longDescriptionEn: 'Long-term security for active systems. Includes real-time server tracking, API version checkups, database routine dumps, priority hotfixes, and up to 3 hours of minor frontend adjustments per month.',
    deliverablesZh: ['月度伺服器運行監控報告', '定期資料庫備份紀錄'],
    deliverablesEn: ['Monthly server latency & uptime report', 'Encrypted routine db dumps'],
    requirementsZh: ['CK Studio 製作或經審核通過的系統程式碼技術權限'],
    requirementsEn: ['Technical root accesses to code developed by CK Studio or pre-vetted systems'],
    basePrice: 5000,
    currency: 'TWD',
    priceLabelZh: 'NT$ 5,000 / 月 起',
    priceLabelEn: 'Starting from NT$ 5,000 / mo',
    billingType: 'monthly',
    depositPercent: 0,
    estimatedDeliveryDays: 30,
    revisionCount: 0,
    showPrice: true,
    isPublic: false,
    isFeatured: false,
    requiresMeeting: false,
    requiresContract: true,
    requiresRemoteAccess: true,
    requiresClientMaterials: true,
    relatedAddOnIds: [],
    relatedContractTemplateId: 'tmpl-maintenance',
    stripePriceId: 'price_mock_maintenance',
    stripePaymentLink: '',
    status: 'active',
    visibility: 'hidden',
    availability: 'consultation_required',
    showOnHome: false,
    showOnServicesPage: false,
    showOnPricingPage: false,
    showOnStartProjectPage: false,
    showInQuoteBuilder: true,
    showInAdminOnly: true,
    allowDirectCheckout: false,
    allowQuoteRequest: false,
    allowLineConsultation: false,
    allowBooking: false,
    allowWaitlist: false,
    sortOrder: 10,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  }
];

const defaultProjects: Project[] = [
  {
    id: 'proj-kelvin-trading',
    slug: 'kelvin-trading',
    titleZh: 'Kelvin Trading Intelligence 盤前情報站',
    titleEn: 'Kelvin Trading Intelligence',
    category: 'Market Intelligence',
    descriptionZh: '基於 CME PG40 官方資料的盤前交易情報平台，用於視覺化 GEX、Gamma、Call Wall、Put Wall、Gamma Flip、HVL 與 NQ / ES 盤中確認劇本。',
    descriptionEn: 'A CME PG40 based pre-market trading intelligence platform that visualizes GEX, Gamma, Call Wall, Put Wall, Gamma Flip, HVL and intraday confirmation scenarios for NQ / ES traders.',
    longDescriptionZh: '這是一個世界級的專業交易工作台。每日清晨由背景 Python 腳本自動爬取 CME 芝加哥商品交易所的官方 PG40 大宗交易申報文件，進行期權未平倉量（OI）與伽馬敞口（GEX）的動態計算。React 儀表板實時視覺化展示關鍵的 Call Wall、Put Wall、Gamma Flip 價格防守區間，輔助高頻及日內交易員快速制定決策劇本。',
    longDescriptionEn: 'A world-class professional trading command center. Every morning, Python cron instances crawl official CME Chicago Exchange PG40 block declarations to dynamically project net options open interest (OI) and gamma exposure (GEX). The React terminal maps out Call Walls, Put Walls, and Gamma Flip points to deliver daily pre-market scripts directly for ES and NQ futures traders.',
    techStack: ['Next.js', 'Python', 'CME PG40', 'TradingView Webhook', 'Recharts'],
    featuresZh: ['CME 官方資料每日全自動抓取與解析', 'GEX 伽馬敞口與未平倉（OI）曲線視覺化', '自動偵測 Gamma Flip 與 HVL 波動率極值', '每日盤前關鍵防守劇本 PDF 一鍵導出'],
    featuresEn: ['Daily automated crawling of official CME PG40 documents', 'Options GEX exposure & net Open Interest visualization', 'Dynamic detection of Gamma Flip & HVL volatility levels', 'One-click export of pre-market trade templates'],
    status: 'active',
    isFeatured: true,
    coverStyle: 'purple-glow',
    sortOrder: 1,
    problemZh: '日內交易員在期貨市場常面臨「看不清大戶期權防守牆」的劣勢，手動下載並在試算表計算 CME PG40 申報單費時且容易出錯。',
    problemEn: 'Intraday futures traders struggle to track institutional market-maker hedging walls in real-time, manually parsing complex CME block option worksheets takes hours and is prone to calculation lag.',
    solutionZh: '利用 Python 與 C++ 庫加速數據解析，建立自動化定時工作流，並在 React 前端利用 Recharts 渲染高精度籌碼水位圖，為交易員提供無延遲的決策終端。',
    solutionEn: 'Developed a Python-based option pricing pipeline to decrypt daily CME statements, hosting an interactive React client rendered with Recharts for visual support.',
    resultZh: '協助 200+ 專業期貨交易員每日省去 2 小時數據彙整時間，盤前情報點位預測準確率達 84.7%。',
    resultEn: 'Saves 2+ hours daily for 200+ active traders, boosting pre-market boundary accuracy to 84.7%.',
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'proj-ck-trading-hub',
    slug: 'ck-trading-hub',
    titleZh: 'CK Trading Hub 風控工作台',
    titleEn: 'CK Trading Hub Dashboard',
    category: 'Trading Tools',
    descriptionZh: '交易紀錄與 Prop Firm 風控工作台，用於追蹤 RR、EV、MDD、保本單、CSV 備份與 Trailing Threshold 風險。',
    descriptionEn: 'A trading journal and prop firm risk management dashboard for tracking RR, EV, MDD, BE trades, CSV backups and trailing threshold protection.',
    longDescriptionZh: '專為 Prop Firm（如 FTMO, Apex）自營交易員設計。本系統能即時匯入交易 CSV 檔案，動態估算當前的期望值（EV）、賺賠比（RR）、最大回撤（MDD），並為 Trailing Threshold（移動回撤限制）提供安全距離警告，防止因情緒化交易違反風控規則而遭淘汰。',
    longDescriptionEn: 'Engineered specifically for prop firm funding challenges. It allows active users to drag-and-drop platform CSV logs to estimate mathematical Expected Value (EV), win-loss Risk Reward (RR) ratios, and maximum drawdowns, warning users about approaching dynamic trailing limits.',
    techStack: ['React', 'TypeScript', 'CSV Engine', 'Risk-Analytics Core'],
    featuresZh: ['一鍵拖曳匯入 MT5 / Rithmic CSV 交易紀錄', '期望值（EV）與回報分布熱力圖', '極速移動回撤防護（Trailing Shield）即時計數', '個人交易心理筆記與標籤關聯分析'],
    featuresEn: ['Instant drag-and-drop for MT5/Rithmic trading history CSVs', 'Expected Value & win rate matrix heatmaps', 'Dynamic trailing drawdown safety alerts', 'Tag-based journal search for psychological tracking'],
    status: 'active',
    isFeatured: true,
    coverStyle: 'emerald-grid',
    sortOrder: 2,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'proj-tv-indicator-suite',
    slug: 'tv-indicator-suite',
    titleZh: 'TradingView 專業指標套件',
    titleEn: 'TradingView Indicator Suite',
    category: 'TradingView / Pine Script',
    descriptionZh: 'TradingView Pine Script 指標套件，包含 GEX levels、ORB、VWAP、20MA 趨勢濾網、Volume Profile、CVD、SMC、FVG 與 webhook alerts。',
    descriptionEn: 'A suite of Pine Script indicators for GEX levels, ORB, VWAP, 20MA trend filters, Volume Profile, CVD, SMC, FVG and webhook alerts.',
    longDescriptionZh: '這是一個整合度極高的 TradingView Pine Script 指標全家桶，專注於籌碼面與價格行為分析（SMC / Price Action）。利用 Pine Script v6 的最新陣列與畫線對象功能，在一張圖表上整合了 ORB 開盤區間、VWAP 動態偏離通道、FVG 失衡區、CVD 累計量能分歧與 GEX 大戶籌碼價格防守水位。',
    longDescriptionEn: 'A cohesive library of advanced Pine Script utilities centering orderflow and smart money concepts. Features real-time FVG (Fair Value Gap) shading, ORB (Opening Range Breakout) channels, standard deviation VWAP bounds, CVD (Cumulative Volume Delta) metrics, and structured Webhook formatting rules.',
    techStack: ['Pine Script v6', 'Webhook Engine', 'TradingView Client'],
    featuresZh: ['100% 基於 Pine Script v6 最新語法開發', 'SMC 聰明錢結構自動標記 (CHoCH, BOS, FVG)', '圖表內建一鍵設定自動化警報 webhook 欄位', '極低圖表資源佔用，支援多時間級別自適應'],
    featuresEn: ['Pure high-performance Pine Script v6 backend code', 'Automated Smart Money Concept indicators (BOS, CHoCH, OB)', 'Integrated JSON webhook alerts builder for immediate bridge', 'Optimized memory allocation for fast browser loads'],
    status: 'active',
    isFeatured: false,
    coverStyle: 'blue-nodes',
    sortOrder: 3,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'proj-context-os',
    slug: 'context-os',
    titleZh: 'Context OS 知識與上下文管理系統',
    titleEn: 'Context OS Knowledge System',
    category: 'AI Knowledge System',
    descriptionZh: 'AI 驅動的知識與上下文管理系統，為創作者、研究者與重度 AI 使用者打造。',
    descriptionEn: 'An AI-powered knowledge and context management system designed for creators, researchers and AI-heavy workflows.',
    longDescriptionZh: '打破碎片化筆記的藩籬。Context OS 利用先進的長上下文管理，讓用戶能一次性拖入多篇研究論文、YouTube 逐字稿與程式庫，並將其壓縮、語意分類為專屬的「AI 上下文包」。當在使用 Gemini 1.5 Pro 等長上下文模型時，能快速抽取出精確資料。',
    longDescriptionEn: 'Transcend folder structures. Context OS provides visual canvas graphs to aggregate websites, massive PDF documents, and project contexts into semantic assets, optimized to populate Gemini long-context tokens accurately.',
    techStack: ['React', 'AI Context Core', 'Vector Database', 'i18n Engine'],
    featuresZh: ['語意化上下文區塊視覺化畫布', '智慧型 Token 數量預估與上下文剪枝', '支援多國語系一鍵同步翻譯對照', '與主流 LLM 提示詞完美相容的 Markdown 匯出'],
    featuresEn: ['Semantic context-block dynamic canvas layout', 'Interactive Token Estimator and automatic context pruning', 'Simultaneous dual-language side-by-side editing', 'Markdown-ready payload compilation'],
    status: 'active',
    isFeatured: true,
    coverStyle: 'titanium-metal',
    sortOrder: 4,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'proj-reel-intel',
    slug: 'reel-intel',
    titleZh: 'Reel Intel 短影音內容研究庫',
    titleEn: 'Reel Intel Creator Database',
    category: 'Creator Intelligence',
    descriptionZh: '短影音內容研究知識庫，用於保存、分類、翻譯與分析 Instagram Reels、TikTok 與 YouTube Shorts。',
    descriptionEn: 'A content research database for saving, organizing, translating and analyzing Instagram Reels, TikTok videos and YouTube Shorts.',
    longDescriptionZh: '為創作者打造的智能內容靈感庫。利用 Chrome 插件或 URL，一鍵將熱門的 Reels/Shorts 丟入系統，背景自動調用 Whisper 進行高精度音訊辨識，再由 AI 進行視覺文字 OCR 辨識、黃金三秒鉤子（Hooks）拆解與文案自動翻譯。',
    longDescriptionEn: 'A trend analyzer built for content creators. Instantly clip URLs from Reels, TikTok, or YouTube Shorts. System crons execute Whisper transcription and visual OCR detection to slice three-second hook scripts and tags.',
    techStack: ['AI Summary', 'OCR', 'Whisper Service', 'URL Parser Node'],
    featuresZh: ['影音 URL 自動下載與音訊抽取過濾', '多語系 Hooks 鉤子與腳本結構深度拆解', '內容成效分類標籤與爆款因子權重分析', '創作者本機腳本庫與一鍵生成改寫 AI'],
    featuresEn: ['Automated background clipping of incoming social URLs', 'Multi-language hooks framing and script categorization', 'Engagement tag analysis and virality weight scoring', 'Local script storage with AI-assisted adaptation rewrite'],
    status: 'active',
    isFeatured: false,
    coverStyle: 'sunset-orange',
    sortOrder: 5,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  }
];

const defaultPlans: PricingPlan[] = [
  {
    id: 'plan-starter',
    nameZh: '極簡精緻形象方案',
    nameEn: 'Starter Website Plan',
    descriptionZh: '適合個人品牌、KOL、小型工作室的 1-3 頁高質感、響應式形象站或 Landing Page。',
    descriptionEn: 'Perfect for personal brands, creators, or small studios. Highly aesthetic 1-3 page site.',
    basePrice: 28000,
    currency: 'TWD',
    priceLabelZh: 'NT$ 28,000 起',
    priceLabelEn: 'Starting from NT$ 28,000',
    billingType: 'one-time',
    depositPercent: 50,
    revisionCount: 1,
    estimatedDeliveryDays: 5,
    featuresZh: ['1-3 頁客製化 RWD 響應式網頁設計', '輕量 motion 動畫與過場微交互效果', '整合基礎 Contact Form 並寄信通知您', '首年基礎 SEO 關鍵字與結構化標籤設定', '提供一整年程式維修基礎保固'],
    featuresEn: ['1-3 custom high-contrast pages', 'Subtle transitions & micro-animations', 'Interactive lead capture form with email routing', 'Meta tags structural SEO configured', '1-year baseline system maintenance support'],
    addOnIds: ['add-page', 'add-seo'],
    isRecommended: false,
    visibility: 'public',
    status: 'active',
    showOnHome: true,
    showOnPricingPage: true,
    showInQuoteBuilder: true,
    isFeatured: false,
    stripePriceId: 'price_mock_starter_plan',
    stripePaymentLink: '',
    sortOrder: 1,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'plan-business',
    nameZh: '商業品牌官網方案',
    nameEn: 'Business Website Plan',
    descriptionZh: '專為企業與成長期 SaaS 打造的 3-6 頁深度品牌形象官網，包含服務細分與 CMS 整合。',
    descriptionEn: 'Tailored for growing SaaS & enterprises. Includes 3-6 pages with complete CMS integration.',
    basePrice: 58000,
    currency: 'TWD',
    priceLabelZh: 'NT$ 58,000 起',
    priceLabelEn: 'Starting from NT$ 58,000',
    billingType: 'one-time',
    depositPercent: 50,
    revisionCount: 2,
    estimatedDeliveryDays: 10,
    featuresZh: ['3-6 頁全客製化響應式介面設計', 'CMS 內容管理系統 (部落格/作品/案例)', '精美圖表與動態折線圖組件展示', '雙語系多國語 i18n 機制配置 (TWD/USD)', '3 次修改保障與正式上線部署協助'],
    featuresEn: ['3-6 bespoke responsive layout views', 'Interactive CMS setup (Blog/Portfolio)', 'Visual SVG charts & data visualizations', 'Dual-language i18n structure setup', '3 guaranteed revisions & launch assistance'],
    addOnIds: ['add-seo', 'add-cms', 'add-blog'],
    isRecommended: true,
    visibility: 'public',
    status: 'active',
    showOnHome: true,
    showOnPricingPage: true,
    showInQuoteBuilder: true,
    isFeatured: true,
    stripePriceId: 'price_mock_business_plan',
    stripePaymentLink: '',
    sortOrder: 2,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'plan-ai-auto',
    nameZh: 'AI 與自動化決策系統',
    nameEn: 'AI & Automation Suite',
    descriptionZh: '專門為交易團隊或高頻營運創作者量身定制。整合 LLM 知識庫、n8n 自動化流程與自訂風控。',
    descriptionEn: 'Customized system integrations with LLM knowledge nodes, n8n automations, and indicator triggers.',
    basePrice: 150000,
    currency: 'TWD',
    priceLabelZh: 'NT$ 150,000 起',
    priceLabelEn: 'Starting from NT$ 150,000',
    billingType: 'one-time',
    depositPercent: 50,
    revisionCount: 3,
    estimatedDeliveryDays: 14,
    featuresZh: ['100% 客製化 API 中介軟體/後台網域', 'n8n 工作流深度建置與 Webhook 對接', 'Gemini / OpenAI 常駐 AI 代理人角色設定', '自訂 Chrome / Playwright 網頁全自動爬取', '高強度資安憑證保管與資料隔離'],
    featuresEn: ['100% custom API middlewares & endpoints', 'Complex n8n workflow deployment & webhooks', 'Gemini/OpenAI state agent context configuration', 'Robotic browser scraping setups (Playwright)', 'Encrypted data vaulting & credential isolating'],
    addOnIds: ['add-emergency', 'add-payment', 'add-line'],
    isRecommended: false,
    visibility: 'public',
    status: 'active',
    showOnHome: true,
    showOnPricingPage: true,
    showInQuoteBuilder: true,
    isFeatured: false,
    stripePriceId: 'price_mock_ai_auto_plan',
    stripePaymentLink: '',
    sortOrder: 3,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  }
];

const defaultAddOns: AddOn[] = [
  {
    id: 'add-page',
    nameZh: '額外客製頁面',
    nameEn: 'Additional Page Upgrade',
    descriptionZh: '增加 1 頁全自適應、高質感響應式子頁面（包含文案排版與動態設計）。',
    descriptionEn: 'Add 1 highly aesthetic fully responsive inner view.',
    price: 5000,
    currency: 'TWD',
    unit: 'page',
    category: 'Design',
    status: 'active',
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'add-cms',
    nameZh: 'CMS 系統整合',
    nameEn: 'Dynamic CMS Integration',
    descriptionZh: '串接 Supabase / Notion 作為無頭 CMS 資料庫，供您在後台自主發布作品、團隊或資訊。',
    descriptionEn: 'Connect Notion/Supabase as a Headless DB, enabling independent updates.',
    price: 20000,
    currency: 'TWD',
    unit: 'flat',
    category: 'Engineering',
    status: 'active',
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'add-seo',
    nameZh: 'SEO 高級優化包',
    nameEn: 'SEO Pro Setup',
    descriptionZh: '包含網站 Sitemap 自動生成、高權重 JSON-LD 結構化資料標記、關鍵字競爭力對抗報告。',
    descriptionEn: 'Includes site crawler maps, high-authority JSON-LD metadata, and ranking reports.',
    price: 12000,
    currency: 'TWD',
    unit: 'flat',
    category: 'Marketing',
    status: 'active',
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'add-blog',
    nameZh: '部落格 / 知識文章系統',
    nameEn: 'Blog & Articles Module',
    descriptionZh: '建置高質感排版部落格頁面，內置 Markdown 語法編譯與社群分享 OpenGraph 標籤。',
    descriptionEn: 'Craft an optimized blog module featuring rich markdown reading layout and OG tags.',
    price: 15000,
    currency: 'TWD',
    unit: 'flat',
    category: 'Marketing',
    status: 'active',
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'add-payment',
    nameZh: 'Stripe 金流刷卡串接',
    nameEn: 'Secure Stripe Checkout',
    descriptionZh: '整合 Stripe API。支援安全信用卡刷卡交易、結帳成功跳轉與後台付款狀態自動更新。',
    descriptionEn: 'Full Stripe API linkup with credit card panels, success route updates, and state trackers.',
    price: 25000,
    currency: 'TWD',
    unit: 'flat',
    category: 'Engineering',
    status: 'active',
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'add-line',
    nameZh: 'LINE OA 自動化串接',
    nameEn: 'LINE OA Chatbot API',
    descriptionZh: '串接 LINE Message API。當有新預約、新聯絡時，官方帳號將自動推播通知您與客戶。',
    descriptionEn: 'Connect LINE Messenger. Dynamically triggers push receipts on new client signups.',
    price: 25000,
    currency: 'TWD',
    unit: 'flat',
    category: 'Automation',
    status: 'active',
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'add-emergency',
    nameZh: '特急開案處理',
    nameEn: 'Express Engineering Delivery',
    descriptionZh: '插隊開案。我們將安排週末及夜間黃金工程時段，縮短高達 40% 的交付天數。',
    descriptionEn: 'Skip the standard queue. Secures active overnight shifts, reducing delivery times by 40%.',
    price: 10000,
    currency: 'TWD',
    unit: 'flat',
    category: 'Service',
    status: 'active',
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'add-maint',
    nameZh: '月度常規系統維修費',
    nameEn: 'Standard Maintenance monthly',
    descriptionZh: '提供常規 API 安全更新、系統定期故障排查與每月 3 小時小修。',
    descriptionEn: 'Monthly code updates, library security scans, and 3 hours of ad-hoc revisions.',
    price: 5000,
    currency: 'TWD',
    unit: 'month',
    category: 'Service',
    status: 'active',
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  }
];

const defaultContractTemplates: ContractTemplate[] = [
  {
    id: 'tmpl-web',
    nameZh: '網頁系統設計開發合約模板',
    nameEn: 'Web System Engineering Agreement',
    category: 'Web',
    contentZh: `<h3>CK Studio 網頁工程開發合約</h3>
<p>本合約（以下稱「本合約」）由雙方共同遵守執行：</p>
<p><strong>委託方（甲方）：</strong>{{clientName}} （統編/身份證字號：{{taxId}}）<br />
<strong>承攬方（乙方）：</strong>CK Studio 技術工作室</p>
<p><strong>第一條：專案名稱與服務範疇</strong><br />
專案名稱：{{projectName}}<br />
服務細目：甲方委託乙方進行包含「{{serviceScope}}」之技術開發。</p>
<p><strong>第二條：交付排程與修改次數</strong><br />
1. 本專案預估工作天為 {{deliveryDays}} 工作天，自甲方付清訂金且交付全部必備開發素材之日起算。<br />
2. 本案承諾提供最多 {{revisionCount}} 次功能或排版細節修改保證。超出次數之修改，應依每小時 NT$ 2,500 計費。</p>
<p><strong>第三條：專案金額與付款條件</strong><br />
1. 專案總價金：TWD {{totalAmount}} 元整（營業稅 5% 另計或內含）。<br />
2. 第一期訂金：雙方簽署本合約時，甲方需支付總金額 {{depositPercent}}% 之訂金（即 TWD {{depositAmount}} 元整），始正式開案。<br />
3. 第二期尾款：於專案開發完成、經甲方測試驗收無誤後 3 日內，甲方應付清尾款（即 TWD {{balanceAmount}} 元整）。</p>
<p><strong>第四條：保密與智慧財產權</strong><br />
1. 乙方對於自甲方獲悉之商業秘密或敏感代碼，承諾予以保密。<br />
2. 於甲方付清本專案全部款項後，本專案客製代碼之使用權與著作財產權歸甲方所有。</p>
<p><strong>第五條：合約成立與簽署</strong><br />
甲方於專屬簽署頁填寫姓名，即視同已完全理解並同意本合約所有內容，本合約即告成立並生效。`,
    contentEn: `<h3>CK Studio Web Engineering Agreement</h3>
<p>This Agreement is entered into by and between:</p>
<p><strong>Client (Party A):</strong> {{clientName}} (Tax ID/ID: {{taxId}})<br />
<strong>Developer (Party B):</strong> CK Studio Technologies</p>
<p><strong>Section 1: Scope of Work</strong><br />
Project Title: {{projectName}}<br />
The Client commissions the Developer to design and engineer: {{serviceScope}}.</p>
<p><strong>Section 2: Timeline & Revisions</strong><br />
1. Estimated delivery timeline is {{deliveryDays}} business days, commencing upon the collection of required deposit and onboarding materials.<br />
2. Developer guarantees up to {{revisionCount}} comprehensive review revisions. Extra adjustments will be charged at NT$ 2,500/hour.</p>
<p><strong>Section 3: Quoted Cost & Payment Schedule</strong><br />
1. Grand Total: TWD {{totalAmount}}<br />
2. Down-Payment Deposit: Client shall settle {{depositPercent}}% of the total cost (TWD {{depositAmount}}) to initiate active development.<br />
3. Final Balance: Upon full deployment and Client verification, the remaining {{balanceAmount}} TWD must be settled within 3 business days.</p>
<p><strong>Section 4: NDA & Intellectual Property</strong><br />
1. Both parties agree to strictly safeguard proprietary datasets and system access keys.<br />
2. Intellectual property and source code execution rights transfer fully to Party A upon complete settlement of all dues.</p>
<p><strong>Section 5: Consent</strong><br />
Entering your name in the designated field acts as your electronic signature, establishing a legally binding contract immediately.`,
    variables: ['clientName', 'taxId', 'projectName', 'serviceScope', 'deliveryDays', 'revisionCount', 'totalAmount', 'depositPercent', 'depositAmount', 'balanceAmount'],
    status: 'active',
    version: 1,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  },
  {
    id: 'tmpl-tv',
    nameZh: 'TradingView 指標與策略開發合約模板',
    nameEn: 'TradingView Pine Script Development Agreement',
    category: 'Trading',
    contentZh: `<h3>CK Studio TradingView Pine Script 技術委託合約</h3>
<p><strong>委託方（甲方）：</strong>{{clientName}}<br />
<strong>承攬方（乙方）：</strong>CK Studio 技術工作室</p>
<p><strong>特別聲明（免責與風控）：</strong><br />
1. 乙方所交付之 Pine Script 指標或回測策略，均屬「技術輔助工具」，不構成任何實質投資、交易之邀約或顧問建議。金融交易具極高風險，甲方因使用本工具產生之任何實際交易虧損，均與乙方無涉。<br />
2. 乙方保證程式碼邏輯與甲方提出之規格書完全相符，但不保證該策略在真實市場之獲利表現。</p>
<p><strong>第一條：專案項目</strong><br />
開發項目：{{projectName}} (Pine Script v6)<br />
專案價金：TWD {{totalAmount}} (訂金：TWD {{depositAmount}}，尾款：TWD {{balanceAmount}})</p>
<p><strong>第二條：交付與驗收</strong><br />
乙方提供 TradingView 指標原始代碼。驗收標準以 TradingView 圖表上訊號繪製與甲方原定邏輯之一致性為準。</p>`,
    contentEn: `<h3>CK Studio TradingView Pine Script Agreement</h3>
<p><strong>Client (Party A):</strong> {{clientName}}<br />
<strong>Developer (Party B):</strong> CK Studio Technologies</p>
<p><strong>Risk & Financial Disclaimer:</strong><br />
1. Pine Script indicator codes and strategies engineered by the Developer represent decision-support tools only. They do NOT constitute financial, investment, or legal advisory. Trading involves severe risk; the Developer assumes zero liability for direct or indirect market losses.<br />
2. Developer guarantees logic matches the client specifications exactly but makes no profit warranty.</p>
<p><strong>Section 1: Details</strong><br />
Services: {{projectName}} (Pine Script v6)<br />
Pricing: Grand Total TWD {{totalAmount}} (Deposit: {{depositAmount}}, Balance: {{balanceAmount}})</p>`,
    variables: ['clientName', 'projectName', 'totalAmount', 'depositAmount', 'balanceAmount'],
    status: 'active',
    version: 1,
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-13T09:30:00Z'
  }
];

const defaultBillingSettings: BillingSettings = {
  enableStripe: true,
  enableManualPayment: true,
  enableEcpay: false,
  enableNewebPay: false,
  showInvoiceFields: false,
  showTaxIdField: false,
  showInvoiceTitleField: false,
  showCarrierField: false,
  enableReceiptDownload: true,
  enablePaymentProofDownload: true,
  enableTaiwanEInvoice: false,
  requireBillingInfoBeforePayment: false
};

const defaultSiteSettings: SiteSettings = {
  studioName: 'CK Studio',
  taglineZh: '為交易員、創作者與企業打造 AI 驅動的智能軟體系統。',
  taglineEn: 'Building intelligent software for traders, creators, and businesses.',
  email: 'contact@ckstudio.tech',
  phone: '+886 912 345 678',
  officialLineUrl: 'https://lin.ee/your-line-placeholder',
  bookingUrl: 'https://calendly.com/your-calendly-placeholder',
  socials: {
    github: 'https://github.com/ck-studio',
    twitter: 'https://twitter.com/ck_studio'
  },
  defaultLanguage: 'zh',
  defaultTheme: 'dark',
  brandColor: '#1A1A1A'
};

// HIGH-FIDELITY LOCAL STORAGE DATABASE ENGINE
class LocalStorageRepository {
  private isBrowser = typeof window !== 'undefined';

  private load<T>(key: string, defaultValue: T[]): T[] {
    if (!this.isBrowser) return defaultValue;
    const data = localStorage.getItem(`ck_os_${key}`);
    if (!data) {
      this.save(key, defaultValue);
      return defaultValue;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private loadObject<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser) return defaultValue;
    const data = localStorage.getItem(`ck_os_${key}`);
    if (!data) {
      this.saveObject(key, defaultValue);
      return defaultValue;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private save<T>(key: string, value: T[]): void {
    if (this.isBrowser) {
      localStorage.setItem(`ck_os_${key}`, JSON.stringify(value));
    }
  }

  private saveObject<T>(key: string, value: T): void {
    if (this.isBrowser) {
      localStorage.setItem(`ck_os_${key}`, JSON.stringify(value));
    }
  }

  // 1. PROJECTS
  async getProjects(): Promise<Project[]> {
    return this.load<Project>('projects', defaultProjects);
  }
  saveProjects(projects: Project[]): void {
    this.save('projects', projects);
    this.logAction('system', 'update_all_projects', 'projects', 'all');
  }

  // 2. SERVICE CATEGORIES & ITEMS
  async getCategories(): Promise<ServiceCategory[]> {
    return this.load<ServiceCategory>('categories', defaultCategories);
  }
  saveCategories(cats: ServiceCategory[]): void {
    this.save('categories', cats);
    this.logAction('system', 'update_service_categories', 'categories', 'all');
  }

  async getServices(): Promise<Service[]> {
    return this.load<Service>('services', defaultServices);
  }
  saveServices(services: Service[]): void {
    this.save('services', services);
    this.logAction('system', 'update_all_services', 'services', 'all');
  }

  // 3. PRICING PLANS
  async getPricingPlans(): Promise<PricingPlan[]> {
    return this.load<PricingPlan>('plans', defaultPlans);
  }
  savePricingPlans(plans: PricingPlan[]): void {
    this.save('plans', plans);
    this.logAction('system', 'update_pricing_plans', 'plans', 'all');
  }

  // 4. ADDONS
  async getAddOns(): Promise<AddOn[]> {
    return this.load<AddOn>('addons', defaultAddOns);
  }
  saveAddOns(addons: AddOn[]): void {
    this.save('addons', addons);
    this.logAction('system', 'update_addons', 'addons', 'all');
  }

  // 5. CONTRACT TEMPLATES
  getContractTemplates(): ContractTemplate[] {
    return this.load<ContractTemplate>('templates', defaultContractTemplates);
  }
  saveContractTemplates(templates: ContractTemplate[]): void {
    this.save('templates', templates);
  }

  async createContractTemplate(template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractTemplate> {
    const templates = this.load<ContractTemplate>('templates', defaultContractTemplates);
    const created: ContractTemplate = {
      ...template,
      id: `tmpl-${generateId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templates.push(created);
    this.saveContractTemplates(templates);
    return created;
  }

  async updateContractTemplate(id: string, updates: Partial<ContractTemplate>): Promise<ContractTemplate | null> {
    const templates = this.load<ContractTemplate>('templates', defaultContractTemplates);
    const index = templates.findIndex((item) => item.id === id);
    if (index === -1) return null;
    templates[index] = { ...templates[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveContractTemplates(templates);
    return templates[index];
  }

  async deleteContractTemplate(id: string): Promise<void> {
    this.saveContractTemplates(this.load<ContractTemplate>('templates', defaultContractTemplates).filter((item) => item.id !== id));
  }

  // 6. CLIENTS CRM
  async getClients(): Promise<Client[]> {
    return this.load<Client>('clients', []);
  }
  saveClients(clients: Client[]): void {
    this.save('clients', clients);
  }
  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const clients = this.load<Client>('clients', []);
    const newClient: Client = {
      ...client,
      id: `cli-${generateId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    clients.push(newClient);
    this.saveClients(clients);
    this.logAction('system', 'create_client', 'clients', newClient.id);
    return newClient;
  }

  // 7. INQUIRIES
  async getInquiries(): Promise<Inquiry[]> {
    return this.load<Inquiry>('inquiries', []);
  }
  saveInquiries(inquiries: Inquiry[]): void {
    this.save('inquiries', inquiries);
  }
  async createInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt'>): Promise<Inquiry> {
    const inquiries = this.load<Inquiry>('inquiries', []);
    const newInquiry: Inquiry = {
      ...inquiry,
      id: `inq-${generateId()}`,
      createdAt: new Date().toISOString()
    };
    inquiries.push(newInquiry);
    this.saveInquiries(inquiries);

    // Also auto-create or update a client in CRM
    const clients = this.load<Client>('clients', []);
    const existingClient = clients.find(c => c.email.toLowerCase() === inquiry.email.toLowerCase());
    if (!existingClient) {
      this.createClient({
        type: inquiry.company ? 'company' : 'individual',
        name: inquiry.name,
        companyName: inquiry.company,
        taxId: inquiry.taxId,
        contactName: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        lineId: inquiry.lineId,
        industry: inquiry.industry,
        source: 'Form Inquiry',
        notes: `Inquiry Project Type: ${inquiry.projectType}. Message: ${inquiry.message}`,
        status: 'new'
      });
    } else {
      existingClient.status = 'new';
      existingClient.notes = `${existingClient.notes || ''}\n[New Inquiry ${new Date().toLocaleDateString()}] Budget: ${inquiry.budgetRange}. Msg: ${inquiry.message}`;
      existingClient.updatedAt = new Date().toISOString();
      this.saveClients(clients);
    }

    this.logAction('client', 'submit_inquiry', 'inquiries', newInquiry.id);
    return newInquiry;
  }

  // 8. QUOTES & CONTRACTS
  async getQuotes(): Promise<Quote[]> {
    return this.load<Quote>('quotes', []);
  }
  saveQuotes(quotes: Quote[]): void {
    this.save('quotes', quotes);
  }
  async createQuote(quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quote> {
    const quotes = this.load<Quote>('quotes', []);
    const quoteId = `qte-${generateId()}`;
    const quoteNumber = quoteData.quoteNumber || `Q-${new Date().getFullYear()}${(quotes.length + 1).toString().padStart(4, '0')}`;
    const publicToken = quoteData.publicToken || `token-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    const formattedLineItems: QuoteLineItem[] = quoteData.lineItems.map((item, idx) => ({
      ...item,
      id: `item-${generateId()}-${idx}`,
      quoteId
    }));

    const newQuote: Quote = {
      id: quoteId,
      quoteNumber,
      clientId: quoteData.clientId,
      selectedPlanId: quoteData.selectedPlanId,
      contractTemplateId: quoteData.contractTemplateId,
      customTitleZh: quoteData.customTitleZh,
      customTitleEn: quoteData.customTitleEn,
      subtotal: quoteData.subtotal,
      discount: quoteData.discount,
      tax: quoteData.tax,
      total: quoteData.total,
      depositPercent: quoteData.depositPercent,
      depositAmount: quoteData.depositAmount,
      balanceAmount: quoteData.balanceAmount,
      validUntil: quoteData.validUntil,
      publicToken,
      status: quoteData.status || 'draft',
      notesZh: quoteData.notesZh,
      notesEn: quoteData.notesEn,
      termsZh: quoteData.termsZh,
      termsEn: quoteData.termsEn,
      lineItems: formattedLineItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    quotes.push(newQuote);
    this.saveQuotes(quotes);
    this.logAction('admin', 'create_quote', 'quotes', newQuote.id);
    return newQuote;
  }


  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | null> {
    const quotes = this.load<Quote>('quotes', []);
    const index = quotes.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const lineItems = updates.lineItems
      ? updates.lineItems.map((item, itemIndex) => ({
          ...item,
          id: item.id || `item-${generateId()}-${itemIndex}`,
          quoteId: id,
        }))
      : quotes[index].lineItems;
    quotes[index] = { ...quotes[index], ...updates, lineItems, updatedAt: new Date().toISOString() };
    this.saveQuotes(quotes);
    this.logAction('admin', 'update_quote', 'quotes', id);
    return quotes[index];
  }

  async deleteQuote(id: string): Promise<void> {
    this.saveQuotes(this.load<Quote>('quotes', []).filter((item) => item.id !== id));
    this.saveContracts(this.load<Contract>('contracts', []).filter((item) => item.quoteId !== id));
    this.logAction('admin', 'delete_quote', 'quotes', id);
  }

  async updateQuoteStatus(quoteId: string, status: Quote['status']): Promise<Quote | null> {
    const quotes = this.load<Quote>('quotes', []);
    const idx = quotes.findIndex(q => q.id === quoteId);
    if (idx === -1) return null;
    quotes[idx].status = status;
    quotes[idx].updatedAt = new Date().toISOString();
    this.saveQuotes(quotes);

    // If converted to contract, auto create draft contract
    if (status === 'converted_to_contract') {
      this.createContractFromQuote(quotes[idx]);
    }

    this.logAction('system', `update_quote_status_${status}`, 'quotes', quoteId);
    return quotes[idx];
  }

  async getContracts(): Promise<Contract[]> {
    return this.load<Contract>('contracts', []);
  }
  saveContracts(contracts: Contract[]): void {
    this.save('contracts', contracts);
  }

  async createContractFromQuote(quote: Quote, templateId?: string): Promise<Contract> {
    const contracts = this.load<Contract>('contracts', []);
    const existing = contracts.find((item) => item.quoteId === quote.id);
    if (existing) return existing;

    const client = this.load<Client>('clients', []).find((item) => item.id === quote.clientId);
    const templates = this.load<ContractTemplate>('templates', defaultContractTemplates);
    const template = templates.find((item) => item.id === (templateId || quote.contractTemplateId))
      ?? templates.find((item) => item.status === 'active')
      ?? templates[0];
    if (!template) throw new Error('請先建立至少一個合約範本');
    const rendered = renderContractTemplate(template, quote, client);

    const contract: Contract = {
      id: `ctr-${generateId()}`,
      contractNumber: `C-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`,
      quoteId: quote.id,
      clientId: quote.clientId,
      templateId: template.id,
      projectName: quote.customTitleZh || quote.customTitleEn || '新專案',
      projectDescription: quote.notesZh || quote.notesEn || '',
      serviceScopeZh: rendered.serviceScopeZh,
      serviceScopeEn: rendered.serviceScopeEn,
      amount: quote.total,
      depositAmount: quote.depositAmount,
      balanceAmount: quote.balanceAmount,
      status: 'sent',
      contentZh: rendered.contentZh,
      contentEn: rendered.contentEn,
      publicToken: quote.publicToken,
      signatureConsent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    contracts.push(contract);
    this.saveContracts(contracts);
    this.logAction('admin', 'create_contract_from_quote', 'contracts', contract.id);
    return contract;
  }

  async signContract(contractId: string, signatureName: string): Promise<Contract | null> {
    const contracts = this.load<Contract>('contracts', []);
    const idx = contracts.findIndex(c => c.id === contractId);
    if (idx === -1) return null;

    contracts[idx].signatureName = signatureName;
    contracts[idx].signedAt = new Date().toISOString();
    contracts[idx].acceptedAt = new Date().toISOString();
    contracts[idx].status = 'signed';
    contracts[idx].updatedAt = new Date().toISOString();
    this.saveContracts(contracts);

    // Also update corresponding Quote status
    const quotes = this.load<Quote>('quotes', []);
    const qIdx = quotes.findIndex(q => q.id === contracts[idx].quoteId);
    if (qIdx !== -1) {
      quotes[qIdx].status = 'accepted';
      this.saveQuotes(quotes);
    }

    // Auto-create a pending payment record
    this.createPayment({
      clientId: contracts[idx].clientId,
      quoteId: contracts[idx].quoteId,
      contractId: contracts[idx].id,
      provider: 'stripe',
      amount: contracts[idx].depositAmount > 0 ? contracts[idx].depositAmount : contracts[idx].amount,
      currency: 'TWD',
      status: 'pending'
    });

    this.logAction('client', 'sign_contract', 'contracts', contractId);
    return contracts[idx];
  }

  // 9. PAYMENTS
  async getPayments(): Promise<Payment[]> {
    return this.load<Payment>('payments', []);
  }
  savePayments(payments: Payment[]): void {
    this.save('payments', payments);
  }
  async createPayment(payment: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt'>): Promise<Payment> {
    const payments = this.load<Payment>('payments', []);
    const paymentNumber = `P-${new Date().getFullYear()}${(payments.length + 1).toString().padStart(4, '0')}`;
    const newPayment: Payment = {
      ...payment,
      id: `pay-${generateId()}`,
      paymentNumber,
      createdAt: new Date().toISOString()
    };
    payments.push(newPayment);
    this.savePayments(payments);
    this.logAction('system', 'create_payment_ledger', 'payments', newPayment.id);
    return newPayment;
  }

  completePayment(paymentId: string, provider: Payment['provider'], stripeSessionId?: string): Payment | null {
    const payments = this.load<Payment>('payments', []);
    const idx = payments.findIndex(p => p.id === paymentId);
    if (idx === -1) return null;

    payments[idx].status = 'paid';
    payments[idx].provider = provider;
    payments[idx].stripeSessionId = stripeSessionId;
    payments[idx].paidAt = new Date().toISOString();
    this.savePayments(payments);

    // Update contract status
    if (payments[idx].contractId) {
      const contracts = this.load<Contract>('contracts', []);
      const cIdx = contracts.findIndex(c => c.id === payments[idx].contractId);
      if (cIdx !== -1) {
        contracts[cIdx].status = 'deposit_paid';
        contracts[cIdx].updatedAt = new Date().toISOString();
        this.saveContracts(contracts);
      }
    }

    this.logAction('client', 'settle_payment', 'payments', paymentId);
    return payments[idx];
  }

  // 10. WAITLIST
  async getWaitlist(): Promise<Waitlist[]> {
    return this.load<Waitlist>('waitlist', []);
  }
  saveWaitlist(items: Waitlist[]): void {
    this.save('waitlist', items);
  }
  async createWaitlist(item: Omit<Waitlist, 'id' | 'createdAt' | 'status'>): Promise<Waitlist> {
    const list = this.load<Waitlist>('waitlist', []);
    const newItem: Waitlist = {
      ...item,
      id: `wait-${generateId()}`,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    list.push(newItem);
    this.saveWaitlist(list);
    this.logAction('client', 'register_waitlist', 'waitlist', newItem.id);
    return newItem;
  }

  // 11. BILLING SETTINGS
  async getBillingSettings(): Promise<BillingSettings> {
    return this.loadObject<BillingSettings>('billing_settings', defaultBillingSettings);
  }
  saveBillingSettings(settings: BillingSettings): void {
    this.saveObject('billing_settings', settings);
    this.logAction('admin', 'save_billing_settings', 'settings', 'billing');
  }

  // 12. SITE SETTINGS
  async getSiteSettings(): Promise<SiteSettings> {
    return this.loadObject<SiteSettings>('site_settings', defaultSiteSettings);
  }
  saveSiteSettings(settings: SiteSettings): void {
    this.saveObject('site_settings', settings);
    this.logAction('admin', 'save_site_settings', 'settings', 'site');
  }

  // 13. ADDITIONAL CRUD FOR SITE OS CONSOLE
  async createProject(project: Project): Promise<Project> {
    const projects = this.load<Project>('projects', defaultProjects);
    project.id = project.id || `proj-${generateId()}`;
    project.createdAt = project.createdAt || new Date().toISOString();
    project.updatedAt = project.updatedAt || new Date().toISOString();
    projects.push(project);
    this.saveProjects(projects);
    this.logAction('admin', 'create_project', 'projects', project.id);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const projects = this.load<Project>('projects', defaultProjects);
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    projects[idx] = { ...projects[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveProjects(projects);
    this.logAction('admin', 'update_project', 'projects', id);
    return projects[idx];
  }

  async deleteProject(id: string): Promise<void> {
    const projects = this.load<Project>('projects', defaultProjects);
    const filtered = projects.filter(p => p.id !== id);
    this.saveProjects(filtered);
    this.logAction('admin', 'delete_project', 'projects', id);
  }


  async uploadProjectImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('圖片讀取失敗'));
      reader.readAsDataURL(file);
    });
  }

  async deleteProjectImage(): Promise<void> {
    return;
  }

  async createService(service: Service): Promise<Service> {
    const services = this.load<Service>('services', defaultServices);
    service.id = service.id || `srv-${generateId()}`;
    service.createdAt = service.createdAt || new Date().toISOString();
    service.updatedAt = service.updatedAt || new Date().toISOString();
    services.push(service);
    this.saveServices(services);
    this.logAction('admin', 'create_service', 'services', service.id);
    return service;
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
    const services = this.load<Service>('services', defaultServices);
    const idx = services.findIndex(s => s.id === id);
    if (idx === -1) return null;
    services[idx] = { ...services[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveServices(services);
    this.logAction('admin', 'update_service', 'services', id);
    return services[idx];
  }

  async updatePaymentStatus(id: string, status: Payment['status']): Promise<Payment | null> {
    const payments = this.load<Payment>('payments', []);
    const idx = payments.findIndex(p => p.id === id);
    if (idx === -1) return null;
    payments[idx].status = status;
    payments[idx].paidAt = status === 'paid' ? new Date().toISOString() : undefined;
    this.savePayments(payments);
    this.logAction('admin', 'update_payment_status', 'payments', id);
    return payments[idx];
  }

  async createContract(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    const contracts = this.load<Contract>('contracts', []);
    const newContract: Contract = {
      ...contract,
      id: `ctr-${generateId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    contracts.push(newContract);
    this.saveContracts(contracts);
    this.logAction('admin', 'create_contract', 'contracts', newContract.id);
    return newContract;
  }

  async updateContract(id: string, updates: Partial<Contract>): Promise<Contract | null> {
    const contracts = this.load<Contract>('contracts', []);
    const index = contracts.findIndex((item) => item.id === id);
    if (index === -1) return null;
    contracts[index] = { ...contracts[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveContracts(contracts);
    this.logAction('admin', 'update_contract', 'contracts', id);
    return contracts[index];
  }

  async deleteContract(id: string): Promise<void> {
    this.saveContracts(this.load<Contract>('contracts', []).filter((item) => item.id !== id));
    this.logAction('admin', 'delete_contract', 'contracts', id);
  }

  async getPublicWorkspace(token: string): Promise<PublicWorkspace | null> {
    const quotes = this.load<Quote>('quotes', []);
    const contracts = this.load<Contract>('contracts', []);
    const quote = quotes.find((item) => item.publicToken === token)
      ?? quotes.find((item) => contracts.some((contract) => contract.publicToken === token && contract.quoteId === item.id))
      ?? null;
    const contract = contracts.find((item) => item.publicToken === token || item.quoteId === quote?.id) ?? null;
    if (!quote && !contract) return null;
    const clientId = quote?.clientId || contract?.clientId;
    const client = this.load<Client>('clients', []).find((item) => item.id === clientId) ?? null;
    return {
      quote,
      contract,
      client: client ? {
        id: client.id,
        name: client.name,
        companyName: client.companyName,
        contactName: client.contactName,
        email: client.email,
      } : null,
    };
  }

  async acceptPublicQuote(token: string): Promise<PublicWorkspace> {
    const workspace = await this.getPublicWorkspace(token);
    if (!workspace?.quote) throw new Error('找不到報價單');
    await this.updateQuoteStatus(workspace.quote.id, 'accepted');
    await this.createContractFromQuote({ ...workspace.quote, status: 'accepted' });
    const refreshed = await this.getPublicWorkspace(token);
    if (!refreshed) throw new Error('報價單更新失敗');
    return refreshed;
  }

  async signPublicContract(token: string, signatureName: string): Promise<PublicWorkspace> {
    const workspace = await this.getPublicWorkspace(token);
    if (!workspace?.contract) throw new Error('找不到合約');
    await this.signContract(workspace.contract.id, signatureName);
    const refreshed = await this.getPublicWorkspace(token);
    if (!refreshed) throw new Error('合約更新失敗');
    return refreshed;
  }

  async updateContractStatus(id: string, status: Contract['status']): Promise<Contract | null> {
    const contracts = this.load<Contract>('contracts', []);
    const idx = contracts.findIndex(c => c.id === id);
    if (idx === -1) return null;
    contracts[idx].status = status;
    contracts[idx].updatedAt = new Date().toISOString();
    this.saveContracts(contracts);
    this.logAction('admin', 'update_contract_status', 'contracts', id);
    return contracts[idx];
  }

  // 14. AUDIT LOGS
  async getAuditLogs(): Promise<AuditLog[]> {
    return this.load<AuditLog>('audit_logs', []);
  }
  logAction(actor: string, action: string, entityType: string, entityId: string, before?: any, after?: any): void {
    if (!this.isBrowser) return;
    const logs = this.load<AuditLog>('audit_logs', []);
    const newLog: AuditLog = {
      id: `log-${generateId()}`,
      actor,
      action,
      entityType,
      entityId,
      before,
      after,
      createdAt: new Date().toISOString()
    };
    logs.unshift(newLog); // newest first
    this.save('audit_logs', logs.slice(0, 100)); // limit to 100 logs
  }
}

// ─── Smart repository selector ───────────────────────────────────────────────
// Uses Supabase when env vars are present, falls back to LocalStorage otherwise

import { isSupabaseEnabled } from '../supabase/client';
import { SupabaseRepository } from '../supabase/repository';

const localRepo = new LocalStorageRepository();
const supabaseRepo = isSupabaseEnabled ? new SupabaseRepository() : null;

export const repository = supabaseRepo ?? localRepo;
export const isUsingSupabase = !!supabaseRepo;
