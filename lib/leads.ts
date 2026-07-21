// Заявки клиента: сохраняются локально (видны в личном кабинете) и отправляются
// на /api/lead — там позже подключается CRM / Telegram-бот / почта.

export interface Lead {
  id: string;
  type: "Подбор авто" | "Расчет доставки" | "Вопрос" | "Заявка по авто";
  summary: string;
  details?: string;
  createdAt: string;
}

const LEADS_KEY = "begov_leads";

export function getLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LEADS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveLead(input: Omit<Lead, "id" | "createdAt">): Lead {
  const lead: Lead = {
    ...input,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
  };
  const leads = [lead, ...getLeads()];
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  }).catch(() => {});
  return lead;
}
