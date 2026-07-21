// Заявки уходят в базу через /api/lead — их видно в админке и (для
// залогиненных клиентов) в личном кабинете на /account.

export interface Lead {
  type: "Подбор авто" | "Расчет доставки" | "Вопрос" | "Заявка по авто" | "Фото и ДТП по VIN";
  summary: string;
  details?: string;
  name?: string;
  phone?: string;
  country?: string;
}

export function saveLead(input: Lead) {
  fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).catch(() => {});
}
