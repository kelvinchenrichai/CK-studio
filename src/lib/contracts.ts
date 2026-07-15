import { Client, ContractTemplate, Quote } from '../types';

const formatMoney = (value: number) => Number(value || 0).toLocaleString('zh-TW');

export function renderContractTemplate(
  template: ContractTemplate,
  quote: Quote,
  client: Client | undefined,
  options?: { deliveryDays?: number; revisionCount?: number },
) {
  const scopeZh = quote.lineItems.map((item) => `${item.titleZh} × ${item.quantity}`).join('、');
  const scopeEn = quote.lineItems.map((item) => `${item.titleEn} × ${item.quantity}`).join(', ');
  const replacements: Record<string, string> = {
    clientName: client?.contactName || client?.name || '',
    companyName: client?.companyName || '',
    taxId: client?.taxId || '',
    projectName: quote.customTitleZh || quote.customTitleEn,
    projectNameZh: quote.customTitleZh,
    projectNameEn: quote.customTitleEn,
    serviceScope: scopeZh,
    serviceScopeZh: scopeZh,
    serviceScopeEn: scopeEn,
    deliveryDays: String(options?.deliveryDays ?? 30),
    revisionCount: String(options?.revisionCount ?? 2),
    totalAmount: formatMoney(quote.total),
    depositPercent: String(quote.depositPercent),
    depositAmount: formatMoney(quote.depositAmount),
    balanceAmount: formatMoney(quote.balanceAmount),
    quoteNumber: quote.quoteNumber,
    validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('zh-TW') : '',
    startDate: new Date().toLocaleDateString('zh-TW'),
  };

  const apply = (input: string) => Object.entries(replacements).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{{${key}}}`, 'g'), value),
    input || '',
  );

  return {
    contentZh: apply(template.contentZh),
    contentEn: apply(template.contentEn),
    serviceScopeZh: scopeZh,
    serviceScopeEn: scopeEn,
  };
}
