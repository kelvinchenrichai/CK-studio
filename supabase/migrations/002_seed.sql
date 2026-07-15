-- CK Studio - Seed Data
-- Run AFTER 001_schema.sql

-- Service Categories
insert into service_categories (id, name_zh, name_en, description_zh, description_en, is_public, sort_order, icon_name) values
('ai-dev', 'AI 系統研發', 'AI Development', '客製化 LLM 整合、AI Agent 部署與長上下文自動化研究', 'Custom LLM integrations, AI Agent deployment, and long-context automations.', true, 1, 'Cpu'),
('trading-solutions', '交易決策智能', 'Trading Solutions', 'TradingView Pine Script 開發、CME PG40 籌碼分析與風控系統', 'TradingView Pine Script suites, CME PG40 analysis, and prop risk controls.', true, 2, 'TrendingUp'),
('web-dev', '高質感網頁開發', 'Web Development', 'Next.js / React 品牌官網、Landing Page 與高轉換 CMS 系統', 'Next.js / React brand sites, high-converting Landing Pages, and premium CMS.', true, 3, 'Globe'),
('automation', '自動化工作流', 'Automation', 'n8n 自動化、LINE OA 機器人、瀏覽器 Playwright 無人化操作', 'n8n automations, LINE OA bots, and Playwright browser robotic workflows.', true, 4, 'Activity'),
('business-systems', '企業營運系統', 'Business Systems', 'ezPretty 預約系統整合、儲值/返利機制與客製後台管理系統', 'ezPretty system integrations, store recharges/rebates, and customized CRMs.', true, 5, 'Sliders'),
('remote-setup', '遠端技術部署', 'Remote Setup', '小龍蝦/OpenClaw 設定、本地 AI Agent 執行環境遠端安裝', 'OpenClaw setup, local AI Agent runtimes, and secure remote installation.', true, 6, 'Terminal'),
('consulting', '技術顧問諮詢', 'Consulting', '一對一技術可行性對接、系統架構設計與顧問週會', 'One-on-one feasibility analysis, system architecture design, and advisory calls.', true, 7, 'MessageSquare'),
('maintenance', '系統維護', 'Maintenance', '網站、系統、自動化流程的基礎維護、錯誤修復與小幅調整', 'Monthly maintenance for websites, systems, and automation workflows.', true, 8, 'Shield')
on conflict (id) do nothing;

-- Services
insert into services (id, category_id, title_zh, title_en, short_description_zh, short_description_en, base_price, price_label_zh, price_label_en, billing_type, status, visibility, availability, requires_meeting, requires_contract, allow_direct_checkout, allow_quote_request, allow_line_consultation, allow_booking, sort_order) values
('tv-indicator', 'trading-solutions', 'TradingView Pine Script 指標開發', 'TradingView Pine Script Indicator Development', '為交易員客製 TradingView 指標、策略、Alert 與 Webhook', 'Custom TradingView indicators, strategies, alerts, and webhook workflows.', 12000, 'NT$ 12,000 起', 'Starting from NT$ 12,000', 'starting_from', 'active', 'public', 'consultation_required', true, true, false, true, true, true, 1),
('tv-backtest', 'trading-solutions', 'TradingView 策略回測開發', 'TradingView Strategy Backtest Development', '將交易邏輯轉換為 Pine Script 回測策略', 'Turn trading logic into Pine Script backtesting strategies.', 18000, 'NT$ 18,000 起', 'Starting from NT$ 18,000', 'starting_from', 'active', 'public', 'consultation_required', true, true, false, true, true, true, 2),
('ai-agent-setup', 'remote-setup', 'AI Agent 遠端安裝設定', 'AI Agent Remote Setup', '協助客戶遠端安裝與設定 AI Agent、自動化工具', 'Remote setup for AI agents, automation tools, and basic workflows.', 5000, 'NT$ 5,000 起', 'Starting from NT$ 5,000', 'starting_from', 'beta', 'public', 'consultation_required', true, false, false, true, true, true, 1),
('openclaw-setup', 'remote-setup', '小龍蝦 / OpenClaw 本地 Agent 設定', 'OpenClaw / Local Agent Remote Setup', '協助客戶設定本地 AI Agent、Browser Automation、Playwright', 'Remote setup for local AI agents, browser automation, Playwright.', 8000, 'NT$ 8,000 起', 'Starting from NT$ 8,000', 'starting_from', 'coming_soon', 'public', 'waitlist', false, false, false, false, true, false, 2),
('n8n-workflow', 'automation', 'n8n 自動化流程建置', 'n8n Automation Workflow', '建立表單、Webhook、Google Sheet、Gmail、LINE、Telegram 自動化流程', 'Build automation workflows with forms, webhooks, Google Sheets, Gmail, LINE.', 15000, 'NT$ 15,000 起', 'Starting from NT$ 15,000', 'starting_from', 'active', 'public', 'consultation_required', true, false, false, true, true, true, 1),
('line-oa', 'automation', 'LINE OA 自動化設定', 'LINE OA Automation Setup', '協助設定 LINE 官方帳號、自動回覆、表單串接', 'Setup LINE Official Account automation, auto-replies, forms, lead collection.', 15000, 'NT$ 15,000 起', 'Starting from NT$ 15,000', 'starting_from', 'active', 'public', 'consultation_required', true, false, false, true, true, true, 2),
('landing-page', 'web-dev', '高質感 Landing Page 建置', 'Premium Landing Page Development', '為個人品牌、商家或服務打造高質感響應式 Landing Page', 'Premium responsive landing page for personal brands and businesses.', 28000, 'NT$ 28,000 起', 'Starting from NT$ 28,000', 'starting_from', 'active', 'public', 'available_now', false, true, false, true, true, true, 1),
('ezpretty', 'business-systems', 'ezPretty 預約系統整合顧問', 'ezPretty Integration Consulting', '協助店家規劃 ezPretty 預約系統、會員、儲值、返點整合方案', 'Consulting for ezPretty booking system integration and custom workflows.', 0, '客製報價', 'Custom Quote', 'custom_quote', 'active', 'public', 'consultation_required', true, true, false, true, true, true, 1),
('tech-consulting', 'consulting', '技術顧問諮詢', 'Technical Consulting Session', '針對 AI、自動化、交易工具、網站、系統開發需求，提供一對一技術諮詢', 'One-on-one consulting for AI, automation, trading tools, and system development.', 2500, 'NT$ 2,500 / hr', 'NT$ 2,500 / hr', 'hourly', 'active', 'public', 'available_now', false, false, true, false, false, true, 1),
('monthly-maintenance', 'maintenance', '系統維護月費', 'Monthly Maintenance', '提供網站、系統、自動化流程的基礎維護、錯誤修復與小幅調整', 'Monthly maintenance including bug fixes and small adjustments.', 5000, 'NT$ 5,000 / month 起', 'Starting from NT$ 5,000 / month', 'monthly', 'active', 'hidden', 'consultation_required', false, false, false, false, false, false, 1)
on conflict (id) do nothing;

-- update openclaw to allow waitlist
update services set allow_waitlist = true where id = 'openclaw-setup';
update services set show_in_quote_builder = true where id = 'monthly-maintenance';

-- Projects
insert into projects (id, slug, title_zh, title_en, category, description_zh, description_en, tech_stack, is_featured, cover_style, sort_order, status) values
('proj-kti', 'kelvin-trading-intelligence', 'Kelvin Trading Intelligence', 'Kelvin Trading Intelligence', 'Market Intelligence', '基於 CME PG40 官方資料的盤前交易情報平台，用於視覺化 GEX、Gamma、Call Wall、Put Wall、Gamma Flip、HVL 與 NQ / ES 盤中確認劇本。', 'A CME PG40 based pre-market trading intelligence platform that visualizes GEX, Gamma, Call Wall, Put Wall, Gamma Flip, HVL and intraday confirmation scenarios for NQ / ES traders.', ARRAY['Next.js', 'Python', 'CME PG40', 'TradingView Webhook', 'Data Dashboard'], true, 'blue-nodes', 1, 'active'),
('proj-cktrade', 'ck-trading-hub', 'CK Trading Hub', 'CK Trading Hub', 'Trading Tools', '交易紀錄與 Prop Firm 風控工作台，用於追蹤 RR、EV、MDD、保本單、CSV 備份與 Trailing Threshold 風險。', 'A trading journal and prop firm risk management dashboard for tracking RR, EV, MDD, BE trades, CSV backups and trailing threshold protection.', ARRAY['React', 'TypeScript', 'CSV', 'Risk Engine'], true, 'titanium-metal', 2, 'active'),
('proj-tv', 'tradingview-indicator-suite', 'TradingView Indicator Suite', 'TradingView Indicator Suite', 'TradingView / Pine Script', 'TradingView Pine Script 指標套件，包含 GEX levels、ORB、VWAP、20MA 趨勢濾網。', 'A suite of Pine Script indicators for GEX levels, ORB, VWAP, 20MA trend filters, Volume Profile, CVD, SMC, FVG and webhook alerts.', ARRAY['Pine Script v6', 'Webhook', 'TradingView'], false, 'emerald-grid', 3, 'active'),
('proj-context', 'context-os', 'Context OS', 'Context OS', 'AI Knowledge System', 'AI 驅動的知識與上下文管理系統，為創作者、研究者與重度 AI 使用者打造。', 'An AI-powered knowledge and context management system designed for creators, researchers and AI-heavy workflows.', ARRAY['React', 'AI', 'Knowledge Base', 'i18n'], true, 'purple-glow', 4, 'active'),
('proj-reel', 'reel-intel', 'Reel Intel', 'Reel Intel', 'Creator Intelligence', '短影音內容研究知識庫，用於保存、分類、翻譯與分析 Instagram Reels、TikTok 與 YouTube Shorts。', 'A content research database for saving, organizing, translating and analyzing Instagram Reels, TikTok videos and YouTube Shorts.', ARRAY['AI Summary', 'OCR', 'Whisper', 'URL Parser'], true, 'sunset-orange', 5, 'active'),
('proj-signal', 'signaledge', 'SignalEdge', 'SignalEdge', 'Sports Intelligence', '運動數據情報平台，用於分析 NBA、世界杯與電競資料，並生成 AI 賽事報告與預測儀表板。', 'A sports intelligence platform for analyzing NBA, World Cup and esports data with AI-assisted match reports and prediction dashboards.', ARRAY['Sports Data', 'AI Reports', 'Dashboard'], false, 'emerald-grid', 6, 'active'),
('proj-mobile', 'ck-mobile-platform', 'CK Mobile Platform', 'CK Mobile Platform', 'Business Automation', 'React + Firebase + Vercel 打造的通訊行代理分潤系統，用於代理管理、訂單登記、分潤計算與業績儀表板。', 'A React + Firebase + Vercel platform for mobile store agents, commission tracking, order management and revenue dashboards.', ARRAY['React', 'Firebase', 'Vercel', 'Admin Dashboard'], false, 'titanium-metal', 7, 'active'),
('proj-turntable', 'turntable-community', 'Turntable Growth System', 'Turntable Growth System', 'Growth System', 'LINE 社群運營與活動轉換系統，用於社群炒群、活動導流、儲值轉換、話術設計與 SOP 建立。', 'A LINE community growth and campaign operation system for engagement, conversion, recharge flows and SOP design.', ARRAY['LINE', 'CRM', 'Growth SOP', 'Campaign System'], false, 'purple-glow', 8, 'active'),
('proj-prompt', 'prompt-architecture', 'Prompt Architecture Research', 'Prompt Architecture Research', 'AI Research', 'Prompt 架構研究，包含角色設計、任務邏輯、AI Coding Prompt、PRD Prompt 與長上下文工作流。', 'A research collection on prompt architecture, role design, task logic, AI coding prompts, PRD prompts and long-context workflows.', ARRAY['Prompt Engineering', 'LLM Workflow'], false, 'blue-nodes', 9, 'active'),
('proj-agent', 'local-agent-lab', 'Local Agent Automation Lab', 'Local Agent Automation Lab', 'Automation Lab', '本地 AI Agent 與自動化實驗室，研究 Browser Automation、Playwright、RPA 與 AI On-call 助理。', 'An experimental lab for local AI agents, browser automation, Playwright workflows, RPA and AI on-call assistants.', ARRAY['Playwright', 'RPA', 'Local Agent', 'Browser Automation'], false, 'emerald-grid', 10, 'active')
on conflict (id) do nothing;

-- Pricing Plans
insert into pricing_plans (id, name_zh, name_en, description_zh, description_en, base_price, currency, price_label_zh, price_label_en, billing_type, deposit_percent, revision_count, estimated_delivery_days, features_zh, features_en, is_recommended, visibility, status, sort_order) values
('plan-starter', '入門網站方案', 'Starter Website', '適合個人品牌、小型商家、基本 Landing Page', 'Perfect for personal brands, small businesses, and basic landing pages.', 28000, 'TWD', 'NT$ 28,000 起', 'Starting from NT$ 28,000', 'one-time', 50, 1, 21, ARRAY['1-3 頁高質感網站', 'RWD 響應式設計', '基礎 SEO', 'Contact Form', '一次修改'], ARRAY['1-3 premium pages', 'Responsive design', 'Basic SEO', 'Contact Form', '1 revision round'], false, 'public', 'active', 1),
('plan-business', '品牌官網方案', 'Business Website', '適合品牌官網、企業網站、服務介紹頁、行銷頁', 'Ideal for brand websites, company sites, and marketing pages.', 58000, 'TWD', 'NT$ 58,000 起', 'Starting from NT$ 58,000', 'one-time', 50, 2, 35, ARRAY['3-6 頁網站', 'CMS 整合', 'SEO 結構優化', 'Contact / Inquiry 表單', '基礎動畫效果', '二次修改'], ARRAY['3-6 pages', 'CMS integration', 'SEO structure', 'Contact / Inquiry forms', 'Basic animations', '2 revision rounds'], true, 'public', 'active', 2),
('plan-system', '企業系統方案', 'Business System', '需要會員、預約、後台、資料管理的企業', 'For businesses needing membership, booking, admin, and data management.', 88000, 'TWD', 'NT$ 88,000 起', 'Starting from NT$ 88,000', 'one-time', 50, 3, 60, ARRAY['客製化前台', '管理後台', '表單 / 預約 / 會員資料', '自動化流程', '基礎資料庫整合', '三次修改'], ARRAY['Custom frontend', 'Admin dashboard', 'Forms / Booking / Member data', 'Automation flows', 'Basic DB integration', '3 revision rounds'], false, 'public', 'active', 3),
('plan-ai', 'AI 自動化系統', 'AI Automation System', '需要 AI、工作流、自動化、知識庫或特殊系統的客戶', 'For clients needing AI, workflows, automation, knowledge bases, or special systems.', 150000, 'TWD', 'NT$ 150,000 起', 'Starting from NT$ 150,000', 'milestone', 30, 0, 90, ARRAY['AI workflow 設計', 'LLM 整合', '知識庫建置', '自動化儀表板', 'API / Webhook 串接', '客製後台管理'], ARRAY['AI workflow design', 'LLM integration', 'Knowledge base', 'Automation dashboard', 'API / Webhook', 'Custom admin panel'], false, 'public', 'active', 4),
('plan-custom', '企業客製專案', 'Custom Enterprise Project', '需求高度客製的企業，完整 Discovery → 交付流程', 'For enterprises with highly custom requirements and full delivery workflows.', 0, 'TWD', '客製報價', 'Custom Quote', 'milestone', 30, 0, 0, ARRAY['Discovery & Scope', '客製報價單', '分期付款', '里程碑交付', '上線後維護'], ARRAY['Discovery & Scope', 'Custom quote', 'Payment schedule', 'Milestone delivery', 'Post-launch support'], false, 'public', 'active', 5)
on conflict (id) do nothing;

-- Add-ons
insert into add_ons (id, name_zh, name_en, description_zh, description_en, price, currency, unit, category) values
('addon-page', '額外頁面', 'Additional Page', '在基本方案外新增頁面', 'Additional page beyond base plan scope.', 5000, 'TWD', 'page', 'web'),
('addon-cms', 'CMS 整合', 'CMS Integration', '串接 Contentful / Sanity / Notion 等 CMS 系統', 'Integration with Contentful, Sanity, Notion, or similar CMS.', 20000, 'TWD', 'flat', 'web'),
('addon-seo', 'SEO 設定', 'SEO Setup', '完整 SEO 結構設定、sitemap、meta、GA4 串接', 'Full SEO setup including sitemap, meta tags, and GA4 integration.', 12000, 'TWD', 'flat', 'web'),
('addon-blog', 'Blog 系統', 'Blog System', '建立 Blog 文章管理系統', 'Blog article management system.', 15000, 'TWD', 'flat', 'web'),
('addon-booking', '預約系統整合', 'Booking System Integration', '串接第三方預約系統或建立自有預約功能', 'Third-party booking system integration or custom booking feature.', 20000, 'TWD', 'flat', 'system'),
('addon-member', '會員系統', 'Member System', '會員註冊、登入、個人頁面功能', 'Member registration, login, and profile page features.', 35000, 'TWD', 'flat', 'system'),
('addon-payment', '金流串接', 'Payment Integration', 'Stripe / ECPay / NewebPay 金流串接', 'Stripe / ECPay / NewebPay payment gateway integration.', 25000, 'TWD', 'flat', 'system'),
('addon-line', 'LINE OA 串接', 'LINE OA Integration', 'LINE 官方帳號串接與自動化設定', 'LINE Official Account integration and automation setup.', 25000, 'TWD', 'flat', 'automation'),
('addon-automation', '自動化工作流', 'Automation Workflow', 'n8n / Webhook 自動化流程建置', 'n8n / Webhook automation workflow setup.', 30000, 'TWD', 'flat', 'automation'),
('addon-ai-chat', 'AI 聊天機器人', 'AI Chatbot', '客製 AI 聊天機器人串接', 'Custom AI chatbot integration.', 50000, 'TWD', 'flat', 'ai'),
('addon-maintain', '月維護費', 'Monthly Maintenance', '每月基礎維護、Bug 修復與小幅調整', 'Monthly maintenance, bug fixes and minor adjustments.', 5000, 'TWD', 'month', 'maintenance'),
('addon-emergency', '緊急支援', 'Emergency Support', '48 小時內緊急技術支援', '48-hour emergency technical support.', 10000, 'TWD', 'flat', 'maintenance')
on conflict (id) do nothing;

-- Contract Templates
insert into contract_templates (id, name_zh, name_en, category, variables, status, version) values
('tmpl-web', '網站開發合約', 'Website Development Contract', 'web', ARRAY['{{clientName}}','{{companyName}}','{{projectName}}','{{totalAmount}}','{{depositAmount}}','{{balanceAmount}}','{{startDate}}','{{deliveryDate}}','{{revisionCount}}'], 'active', 1),
('tmpl-ai', 'AI 自動化合約', 'AI Automation Contract', 'ai', ARRAY['{{clientName}}','{{projectName}}','{{totalAmount}}','{{depositAmount}}','{{balanceAmount}}','{{deliveryDate}}'], 'active', 1),
('tmpl-consulting', '顧問諮詢合約', 'Consulting Contract', 'consulting', ARRAY['{{clientName}}','{{totalAmount}}','{{startDate}}'], 'active', 1),
('tmpl-maintenance', '維護服務合約', 'Maintenance Contract', 'maintenance', ARRAY['{{clientName}}','{{projectName}}','{{totalAmount}}'], 'active', 1)
on conflict (id) do nothing;
