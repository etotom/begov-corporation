import "server-only";
import { formatKm, formatPrice } from "@/lib/cars";
import {
  addTelegramAdmin,
  clearTgSession,
  createLead,
  getCarById,
  getLeadById,
  getLeads,
  getLeadStats,
  getTelegramAdmins,
  getTgSession,
  getVisibleCars,
  isTelegramAdmin,
  removeTelegramAdmin,
  setLeadStatus,
  setTgSession,
} from "@/lib/db";
import {
  answerCallback,
  editText,
  esc,
  notifyNewLead,
  sendChatAction,
  sendMessage,
  sendPhoto,
  STATUS_ICON,
} from "@/lib/telegram";

const OWNER = (process.env.TELEGRAM_OWNER_USERNAME || "etotom").toLowerCase().replace(/^@/, "");
const SITE = "https://begov-corporation.vercel.app";
const PAGE = 6;
const LEADS_PAGE = 5;

// --- Минимальные типы Telegram ---
interface TgUser {
  id: number;
  username?: string;
  first_name?: string;
}
interface TgChat {
  id: number;
  type: string;
}
interface TgMessage {
  message_id: number;
  from?: TgUser;
  chat: TgChat;
  text?: string;
  contact?: { phone_number: string };
}
interface TgCallback {
  id: string;
  from: TgUser;
  message?: TgMessage;
  data?: string;
}
export interface TgUpdate {
  message?: TgMessage;
  callback_query?: TgCallback;
}

// ---------- Клавиатуры / меню ----------

function mainMenuKb() {
  return {
    inline_keyboard: [
      [
        { text: "🚗 Каталог авто", callback_data: "menu:catalog" },
        { text: "🔍 Проверка по VIN", callback_data: "menu:vin" },
      ],
      [
        { text: "🧮 Калькулятор", callback_data: "menu:calc" },
        { text: "📝 Оставить заявку", callback_data: "menu:request" },
      ],
      [
        { text: "❓ Частые вопросы", callback_data: "menu:faq" },
        { text: "📞 Контакты", callback_data: "menu:contacts" },
      ],
      [{ text: "🌐 Открыть сайт", url: SITE }],
    ],
  };
}

const MAIN_TEXT =
  "🚗 <b>Begov Corporation</b> — авто из США, Европы и ОАЭ под ключ до вашего города.\n\n" +
  "Через Грузию, собственными автовозами — в Таджикистан, Узбекистан, Казахстан, Кыргызстан и Россию.\n\n" +
  "Выберите, что вам нужно:";

async function showMainMenu(chatId: number, messageId?: number) {
  if (messageId) await editText(chatId, messageId, MAIN_TEXT, { reply_markup: mainMenuKb() });
  else await sendMessage(chatId, MAIN_TEXT, { reply_markup: mainMenuKb() });
}

function adminMenuKb() {
  return {
    inline_keyboard: [
      [
        { text: "📥 Заявки", callback_data: "admin:leads:0" },
        { text: "📊 Статистика", callback_data: "admin:stats" },
      ],
      [{ text: "👥 Администраторы", callback_data: "admin:admins" }],
      [{ text: "🔙 Клиентское меню", callback_data: "menu:main" }],
    ],
  };
}

async function showAdminMenu(chatId: number, messageId?: number) {
  const text = "🛠 <b>Панель администратора</b>\n\nВыберите раздел:";
  if (messageId) await editText(chatId, messageId, text, { reply_markup: adminMenuKb() });
  else await sendMessage(chatId, text, { reply_markup: adminMenuKb() });
}

// ---------- Каталог ----------

async function showCatalog(chatId: number, page: number, messageId?: number) {
  const cars = await getVisibleCars();
  if (cars.length === 0) {
    const text =
      "Сейчас нет авто в наличии, но мы привезём под заказ с аукционов США, Европы и ОАЭ.\n\nОставьте заявку — подберём под ваш бюджет.";
    const kb = { inline_keyboard: [[{ text: "📝 Оставить заявку", callback_data: "menu:request" }], [{ text: "🔙 Меню", callback_data: "menu:main" }]] };
    if (messageId) await editText(chatId, messageId, text, { reply_markup: kb });
    else await sendMessage(chatId, text, { reply_markup: kb });
    return;
  }

  const pages = Math.ceil(cars.length / PAGE);
  const p = Math.max(0, Math.min(page, pages - 1));
  const slice = cars.slice(p * PAGE, p * PAGE + PAGE);

  const rows = slice.map((c) => [
    {
      text: `${c.make} ${c.model} ${c.year} · ${formatPrice(c.price)}`,
      callback_data: `cat:view:${c.id}`,
    },
  ]);

  const nav: { text: string; callback_data: string }[] = [];
  if (p > 0) nav.push({ text: "◀️", callback_data: `cat:page:${p - 1}` });
  nav.push({ text: `${p + 1}/${pages}`, callback_data: "cat:noop" });
  if (p < pages - 1) nav.push({ text: "▶️", callback_data: `cat:page:${p + 1}` });
  rows.push(nav);
  rows.push([{ text: "🔙 Меню", callback_data: "menu:main" }]);

  const text = `🚗 <b>Авто в наличии и в пути</b> (${cars.length})\n\nНажмите на авто, чтобы посмотреть подробнее:`;
  if (messageId) await editText(chatId, messageId, text, { reply_markup: { inline_keyboard: rows } });
  else await sendMessage(chatId, text, { reply_markup: { inline_keyboard: rows } });
}

async function showCarDetail(chatId: number, carId: number) {
  const car = await getCarById(carId);
  if (!car || !car.visible) {
    await sendMessage(chatId, "Это авто уже недоступно. Посмотрите каталог заново.", {
      reply_markup: { inline_keyboard: [[{ text: "🚗 Каталог", callback_data: "menu:catalog" }]] },
    });
    return;
  }
  const label = `${car.make} ${car.model} ${car.year}`;
  const caption =
    `<b>${esc(label)}</b>\n\n` +
    `💵 <b>${formatPrice(car.price)}</b> — до Грузии, без доставки в ваш город\n\n` +
    `Пробег: ${formatKm(car.mileageKm)}\n` +
    `Двигатель: ${esc(car.engine || "—")} · ${esc(car.fuel)}\n` +
    `Привод: ${esc(car.drive)} · КПП: ${esc(car.gearbox)}\n` +
    `Кузов: ${esc(car.body)} · Цвет: ${esc(car.color || "—")}\n` +
    `Регион: ${esc(car.source)} · Статус: ${esc(car.status)}` +
    (car.photos.length > 1 ? `\n📷 Фото: ${car.photos.length} (все — на сайте)` : "");

  const kb = {
    inline_keyboard: [
      [{ text: "📩 Запросить это авто", callback_data: `req:car:${car.id}` }],
      [{ text: "🌐 Подробнее на сайте", url: `${SITE}/catalog/${car.id}` }],
      [{ text: "🔙 Каталог", callback_data: "menu:catalog" }],
    ],
  };

  if (car.photos[0]) await sendPhoto(chatId, car.photos[0], caption, { reply_markup: kb });
  else await sendMessage(chatId, caption, { reply_markup: kb });
}

// ---------- VIN ----------

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/i;
const VIN_FIELDS: [string, string][] = [
  ["Make", "Марка"],
  ["Model", "Модель"],
  ["ModelYear", "Год"],
  ["Trim", "Комплектация"],
  ["BodyClass", "Кузов"],
  ["DriveType", "Привод"],
  ["DisplacementL", "Объём, л"],
  ["EngineHP", "Мощность, л.с."],
  ["FuelTypePrimary", "Топливо"],
  ["TransmissionStyle", "КПП"],
  ["PlantCountry", "Страна сборки"],
];

async function decodeVin(vin: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.Results?.[0] ?? {};
    if (!raw.Make && !raw.Model) return null;
    const lines = VIN_FIELDS.map(([k, label]) => {
      const v = String(raw[k] ?? "").trim();
      return v && v !== "0" ? `${label}: <b>${esc(v)}</b>` : null;
    }).filter(Boolean);
    return lines.join("\n");
  } catch {
    return null;
  }
}

async function startVin(chatId: number) {
  await setTgSession(chatId, "vin", {});
  await sendMessage(
    chatId,
    "🔍 Отправьте 17-значный <b>VIN-код</b> — покажу заводские характеристики (база NHTSA, США).\n\n<i>История ДТП и фото конкретного авто там не хранятся — их запросим у менеджера.</i>",
    { reply_markup: { inline_keyboard: [[{ text: "❌ Отмена", callback_data: "menu:main" }]] } },
  );
}

// ---------- Заявка (многошаговый сценарий) ----------

async function startRequest(chatId: number, car?: { id: number; label: string }) {
  await setTgSession(chatId, "req_name", car ? { carId: car.id, carLabel: car.label } : {});
  const intro = car ? `Оставляем заявку на <b>${esc(car.label)}</b>.\n\n` : "";
  await sendMessage(chatId, `${intro}Как вас зовут?`, {
    reply_markup: { inline_keyboard: [[{ text: "❌ Отмена", callback_data: "menu:main" }]] },
  });
}

function phoneKb() {
  return {
    keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

async function finishRequest(chatId: number, data: Record<string, unknown>) {
  const carLabel = typeof data.carLabel === "string" ? data.carLabel : "";
  const name = typeof data.name === "string" ? data.name : "";
  const phone = typeof data.phone === "string" ? data.phone : "";
  const note = typeof data.note === "string" ? data.note : "";
  const lead = await createLead({
    type: carLabel ? "Заявка по авто" : "Подбор авто",
    summary: carLabel || "Заявка из Telegram-бота",
    details: note,
    name,
    phone,
    telegramChatId: chatId,
  });
  await clearTgSession(chatId);
  await notifyNewLead(lead);
  await sendMessage(
    chatId,
    `✅ <b>Заявка #${lead.id} принята!</b>\n\nМенеджер свяжется с вами в ближайшее время. Спасибо, что выбрали Begov Corporation!`,
    { reply_markup: { remove_keyboard: true } },
  );
  await showMainMenu(chatId);
}

// ---------- Тексты ----------

const FAQ_TEXT =
  "❓ <b>Частые вопросы</b>\n\n" +
  "💳 <b>Безопасная оплата:</b> никогда не переводите деньги на личную карту «в переписке». Оплата — только по реквизитам в договоре. Просят иначе от нашего имени — это не мы, проверьте у нас напрямую.\n\n" +
  "⏱ <b>Сроки:</b> обычно 30–60 дней от выкупа до получения — зависит от маршрута.\n\n" +
  "🛃 <b>Таможня:</b> платежи страны назначения считаем отдельно — зависят от года и объёма двигателя.\n\n" +
  "🔧 <b>Битые авто:</b> до выкупа присылаем отчёт и фото/видео с аукциона — вы решаете заранее.\n\n" +
  `Полный список — на сайте: ${SITE}/faq`;

const CONTACTS_TEXT =
  "📞 <b>Контакты Begov Corporation</b>\n\n" +
  "🇬🇪 Грузия, Тбилиси · стоянка в Поти\n" +
  "☎️ +995 000 00 00 00\n" +
  "✉️ info@begov-corporation.com\n\n" +
  "Можно написать прямо здесь, в этом чате — передам сообщение менеджеру, и мы ответим вам тут же.";

const CALC_TEXT =
  "🧮 <b>Калькулятор доставки</b>\n\n" +
  "Точный расчёт «под ключ» до вашего города удобнее сделать на сайте — там выбор региона, кузова и города.\n\n" +
  "Или просто напишите здесь: бюджет + город — прикинем и передадим менеджеру для точной сметы.";

// ---------- Роутер сообщений ----------

async function ensureOwner(from?: TgUser, chatId?: number) {
  if (from?.username && chatId != null && from.username.toLowerCase() === OWNER) {
    await addTelegramAdmin({
      chatId,
      username: from.username,
      firstName: from.first_name,
      isOwner: true,
    });
  }
}

async function handleMessage(msg: TgMessage) {
  const chatId = msg.chat.id;
  if (msg.chat.type !== "private") return; // бот работает только в личке
  const from = msg.from;
  await ensureOwner(from, chatId);
  const admin = await isTelegramAdmin(chatId);
  const text = (msg.text || "").trim();
  const cmd = text.split(/\s+/)[0].split("@")[0].toLowerCase();
  const session = await getTgSession(chatId);

  // Отмена из любого состояния
  if (cmd === "/cancel") {
    await clearTgSession(chatId);
    await sendMessage(chatId, "Отменено.", { reply_markup: { remove_keyboard: true } });
    return admin ? showAdminMenu(chatId) : showMainMenu(chatId);
  }

  // /start и меню сбрасывают состояние
  if (cmd === "/start" || cmd === "/menu") {
    await clearTgSession(chatId);
    return showMainMenu(chatId);
  }

  // --- Активные сценарии ---
  if (session.state === "vin") {
    const vin = text.toUpperCase();
    if (!VIN_RE.test(vin)) {
      await sendMessage(chatId, "VIN должен быть из 17 символов (латиница и цифры, без I, O, Q). Попробуйте ещё раз или /cancel.");
      return;
    }
    await sendChatAction(chatId);
    const result = await decodeVin(vin);
    await clearTgSession(chatId);
    if (!result) {
      await sendMessage(
        chatId,
        "По этому VIN данных не нашлось (база NHTSA лучше всего знает авто рынка США). Пришлите VIN менеджеру — проверим вручную.",
        { reply_markup: { inline_keyboard: [[{ text: "📝 Написать менеджеру", callback_data: "menu:request" }], [{ text: "🔙 Меню", callback_data: "menu:main" }]] } },
      );
      return;
    }
    await sendMessage(
      chatId,
      `🔍 <b>VIN ${esc(vin)}</b>\n\n${result}\n\n<i>Фото и историю ДТП конкретного авто запросим у менеджера.</i>`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📸 Запросить фото и ДТП", callback_data: "menu:request" }],
            [{ text: "🔍 Другой VIN", callback_data: "menu:vin" }],
            [{ text: "🔙 Меню", callback_data: "menu:main" }],
          ],
        },
      },
    );
    return;
  }

  if (session.state === "req_name") {
    const name = text.slice(0, 100);
    if (!name) return sendMessage(chatId, "Напишите, пожалуйста, ваше имя.");
    await setTgSession(chatId, "req_phone", { ...session.data, name });
    await sendMessage(chatId, `Приятно познакомиться, ${esc(name)}! Оставьте номер телефона (WhatsApp/Telegram) — нажмите кнопку ниже или напишите вручную.`, {
      reply_markup: phoneKb(),
    });
    return;
  }

  if (session.state === "req_phone") {
    const phone = (msg.contact?.phone_number || text).slice(0, 50);
    if (!phone) return sendMessage(chatId, "Оставьте номер телефона.", { reply_markup: phoneKb() });
    await setTgSession(chatId, "req_note", { ...session.data, phone });
    await sendMessage(chatId, "Что именно ищете? Марка, бюджет, пожелания — или отправьте /skip, если ничего добавить.", {
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  if (session.state === "req_note") {
    const note = cmd === "/skip" ? "" : text.slice(0, 1500);
    return finishRequest(chatId, { ...session.data, note });
  }

  if (session.state === "reply" && admin) {
    const clientChatId = Number(session.data.clientChatId);
    if (!clientChatId) {
      await clearTgSession(chatId);
      return sendMessage(chatId, "Не удалось определить клиента. Отменено.");
    }
    await sendMessage(clientChatId, `💬 <b>Begov Corporation</b>:\n\n${esc(text)}`);
    await clearTgSession(chatId);
    await sendMessage(chatId, "✅ Отправлено клиенту.");
    return;
  }

  // --- Команды ---
  if (cmd === "/vin") return startVin(chatId);
  if (cmd === "/catalog") return showCatalog(chatId, 0);
  if (cmd === "/faq") return sendMessage(chatId, FAQ_TEXT, { reply_markup: { inline_keyboard: [[{ text: "🔙 Меню", callback_data: "menu:main" }]] } });
  if (cmd === "/contacts") return sendMessage(chatId, CONTACTS_TEXT, { reply_markup: { inline_keyboard: [[{ text: "🔙 Меню", callback_data: "menu:main" }]] } });
  if (cmd === "/myid") return sendMessage(chatId, `Ваш Telegram ID: <code>${chatId}</code>\nUsername: ${from?.username ? "@" + esc(from.username) : "—"}`);

  if (admin) {
    if (cmd === "/admin") return showAdminMenu(chatId);
    if (cmd === "/addadmin") {
      const id = Number(text.split(/\s+/)[1]);
      if (!Number.isInteger(id)) return sendMessage(chatId, "Формат: <code>/addadmin 123456789</code>\nПопросите человека отправить боту /myid.");
      await addTelegramAdmin({ chatId: id });
      await sendMessage(id, "✅ Вам выдан доступ администратора бота Begov Corporation. Откройте меню: /admin").catch(() => {});
      return sendMessage(chatId, `✅ Администратор <code>${id}</code> добавлен.`);
    }
    if (cmd === "/deladmin") {
      const id = Number(text.split(/\s+/)[1]);
      if (!Number.isInteger(id)) return sendMessage(chatId, "Формат: <code>/deladmin 123456789</code>");
      const ok = await removeTelegramAdmin(id);
      return sendMessage(chatId, ok ? `✅ Администратор <code>${id}</code> удалён.` : "Не удалось удалить (владельца удалить нельзя).");
    }
    // Прочий текст от админа — показываем панель
    return showAdminMenu(chatId);
  }

  // Прочий текст от клиента — пересылаем менеджерам как сообщение в поддержку
  return relayToAdmins(chatId, from, text);
}

async function relayToAdmins(chatId: number, from: TgUser | undefined, text: string) {
  if (!text) return showMainMenu(chatId);
  const admins = await getTelegramAdmins();
  const who = from?.username ? "@" + from.username : from?.first_name || "клиент";
  const payload = `💬 <b>Сообщение от ${esc(who)}</b> (ID <code>${chatId}</code>):\n\n${esc(text)}`;
  const kb = { inline_keyboard: [[{ text: "↩️ Ответить", callback_data: `dm:${chatId}` }]] };
  for (const a of admins) await sendMessage(a.chatId, payload, { reply_markup: kb });
  await sendMessage(chatId, "Спасибо! Передал ваше сообщение менеджеру — скоро ответим прямо здесь.", {
    reply_markup: { inline_keyboard: [[{ text: "🔙 Меню", callback_data: "menu:main" }]] },
  });
}

// ---------- Роутер callback-кнопок ----------

async function handleCallback(cb: TgCallback) {
  const chatId = cb.message?.chat.id;
  const messageId = cb.message?.message_id;
  if (chatId == null || messageId == null) return;
  await ensureOwner(cb.from, chatId);
  const admin = await isTelegramAdmin(chatId);
  const data = cb.data || "";
  const [ns, a, b] = data.split(":");
  await answerCallback(cb.id);

  if (ns === "menu") {
    if (a === "main") return showMainMenu(chatId, messageId);
    if (a === "catalog") return showCatalog(chatId, 0, messageId);
    if (a === "vin") return startVin(chatId);
    if (a === "request") return startRequest(chatId);
    if (a === "faq") return editText(chatId, messageId, FAQ_TEXT, { reply_markup: { inline_keyboard: [[{ text: "🔙 Меню", callback_data: "menu:main" }]] } });
    if (a === "contacts") return editText(chatId, messageId, CONTACTS_TEXT, { reply_markup: { inline_keyboard: [[{ text: "🔙 Меню", callback_data: "menu:main" }]] } });
    if (a === "calc") return editText(chatId, messageId, CALC_TEXT, { reply_markup: { inline_keyboard: [[{ text: "🌐 Открыть калькулятор", url: `${SITE}/calculator` }], [{ text: "🔙 Меню", callback_data: "menu:main" }]] } });
    return;
  }

  if (ns === "cat") {
    if (a === "page") return showCatalog(chatId, Number(b) || 0, messageId);
    if (a === "view") return showCarDetail(chatId, Number(b));
    return; // noop
  }

  if (ns === "req" && a === "car") {
    const car = await getCarById(Number(b));
    return startRequest(chatId, car ? { id: car.id, label: `${car.make} ${car.model} ${car.year}` } : undefined);
  }

  if (ns === "dm" && admin) {
    await setTgSession(chatId, "reply", { clientChatId: Number(a) });
    return sendMessage(chatId, "Напишите ответ клиенту — я отправлю его. /cancel для отмены.");
  }

  if (ns === "admin" && admin) {
    if (a === "leads") return showLeadsList(chatId, Number(b) || 0, messageId);
    if (a === "stats") return showStats(chatId, messageId);
    if (a === "admins") return showAdmins(chatId, messageId);
    return;
  }

  if (ns === "lead" && admin) {
    const id = Number(b);
    if (a === "view") return showLeadDetail(chatId, id, messageId);
    if (a === "done") {
      await setLeadStatus(id, "done");
      return showLeadDetail(chatId, id, messageId);
    }
    if (a === "new") {
      await setLeadStatus(id, "new");
      return showLeadDetail(chatId, id, messageId);
    }
    if (a === "reply") {
      const lead = await getLeadById(id);
      if (!lead?.telegramChatId) return sendMessage(chatId, "У этой заявки нет Telegram-чата (пришла с сайта). Позвоните по телефону из заявки.");
      await setTgSession(chatId, "reply", { clientChatId: lead.telegramChatId, leadId: id });
      return sendMessage(chatId, "Напишите ответ клиенту — я отправлю его. /cancel для отмены.");
    }
    return;
  }
}

// ---------- Админ: заявки / статистика / администраторы ----------

async function showLeadsList(chatId: number, page: number, messageId?: number) {
  const leads = await getLeads();
  if (leads.length === 0) {
    return editOrSend(chatId, messageId, "Заявок пока нет.", { inline_keyboard: [[{ text: "🔙 Панель", callback_data: "admin:leads:back" }]] });
  }
  const pages = Math.ceil(leads.length / LEADS_PAGE);
  const p = Math.max(0, Math.min(page, pages - 1));
  const slice = leads.slice(p * LEADS_PAGE, p * LEADS_PAGE + LEADS_PAGE);

  const rows = slice.map((l) => [
    {
      text: `${STATUS_ICON[l.status] ?? ""} #${l.id} · ${l.summary.slice(0, 40)}`,
      callback_data: `lead:view:${l.id}`,
    },
  ]);
  const nav: { text: string; callback_data: string }[] = [];
  if (p > 0) nav.push({ text: "◀️", callback_data: `admin:leads:${p - 1}` });
  nav.push({ text: `${p + 1}/${pages}`, callback_data: "cat:noop" });
  if (p < pages - 1) nav.push({ text: "▶️", callback_data: `admin:leads:${p + 1}` });
  rows.push(nav);
  rows.push([{ text: "🔙 Панель", callback_data: "menu:admin" }]);

  const newCount = leads.filter((l) => l.status === "new").length;
  const text = `📥 <b>Заявки</b> — всего ${leads.length}, новых ${newCount}`;
  await editOrSend(chatId, messageId, text, { inline_keyboard: rows });
}

async function showLeadDetail(chatId: number, id: number, messageId?: number) {
  const lead = await getLeadById(id);
  if (!lead) return editOrSend(chatId, messageId, "Заявка не найдена.", { inline_keyboard: [[{ text: "🔙 Заявки", callback_data: "admin:leads:0" }]] });

  const lines = [
    `${STATUS_ICON[lead.status] ?? ""} <b>Заявка #${lead.id}</b> · ${esc(lead.type)}`,
    `Статус: ${lead.status === "new" ? "🟡 Новая" : "✅ Обработана"}`,
    "",
    `<b>${esc(lead.summary)}</b>`,
  ];
  if (lead.details) lines.push(esc(lead.details));
  lines.push("");
  if (lead.name) lines.push(`👤 ${esc(lead.name)}`);
  if (lead.phone) lines.push(`📞 <code>${esc(lead.phone)}</code>`);
  if (lead.country) lines.push(`🌍 ${esc(lead.country)}`);
  lines.push(`🕒 ${new Date(lead.createdAt).toLocaleString("ru-RU")}`);
  lines.push(lead.telegramChatId ? "💬 Источник: Telegram" : "🌐 Источник: сайт");

  const buttons: { text: string; callback_data: string }[][] = [];
  buttons.push([
    lead.status === "new"
      ? { text: "✅ Обработана", callback_data: `lead:done:${lead.id}` }
      : { text: "↩️ Вернуть в новые", callback_data: `lead:new:${lead.id}` },
  ]);
  if (lead.telegramChatId) buttons.push([{ text: "💬 Ответить клиенту", callback_data: `lead:reply:${lead.id}` }]);
  buttons.push([{ text: "🔙 К заявкам", callback_data: "admin:leads:0" }]);

  await editOrSend(chatId, messageId, lines.join("\n"), { inline_keyboard: buttons });
}

async function showStats(chatId: number, messageId?: number) {
  const s = await getLeadStats();
  const text =
    "📊 <b>Статистика</b>\n\n" +
    `🟡 Новых заявок: <b>${s.new}</b>\n` +
    `✅ Обработано: <b>${s.done}</b>\n` +
    `📥 Всего заявок: <b>${s.total}</b>\n` +
    `🚗 Авто в каталоге: <b>${s.cars}</b>`;
  await editOrSend(chatId, messageId, text, { inline_keyboard: [[{ text: "🔙 Панель", callback_data: "menu:admin" }]] });
}

async function showAdmins(chatId: number, messageId?: number) {
  const admins = await getTelegramAdmins();
  const list = admins
    .map((a) => `• ${a.isOwner ? "👑 " : ""}${a.username ? "@" + esc(a.username) : esc(a.firstName) || "—"} — <code>${a.chatId}</code>`)
    .join("\n");
  const text =
    "👥 <b>Администраторы бота</b>\n\n" +
    (list || "—") +
    "\n\n<b>Добавить:</b> человек открывает бота, отправляет /myid, вы присылаете <code>/addadmin ID</code>.\n" +
    "<b>Удалить:</b> <code>/deladmin ID</code>";
  await editOrSend(chatId, messageId, text, { inline_keyboard: [[{ text: "🔙 Панель", callback_data: "menu:admin" }]] });
}

async function editOrSend(
  chatId: number,
  messageId: number | undefined,
  text: string,
  replyMarkup: object,
) {
  if (messageId) await editText(chatId, messageId, text, { reply_markup: replyMarkup });
  else await sendMessage(chatId, text, { reply_markup: replyMarkup });
}

// ---------- Точка входа ----------

export async function handleUpdate(update: TgUpdate): Promise<void> {
  if (update.callback_query) {
    // «menu:admin» — вход в админ-панель из callback
    if (update.callback_query.data === "menu:admin") {
      const chatId = update.callback_query.message?.chat.id;
      const messageId = update.callback_query.message?.message_id;
      await answerCallback(update.callback_query.id);
      if (chatId != null && (await isTelegramAdmin(chatId))) await showAdminMenu(chatId, messageId);
      return;
    }
    await handleCallback(update.callback_query);
    return;
  }
  if (update.message) await handleMessage(update.message);
}
