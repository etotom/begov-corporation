// Плавающая кнопка Telegram-бота — над кнопкой WhatsApp.
const TELEGRAM_BOT = "begovcorp_bot";

export default function TelegramButton() {
  return (
    <a
      href={`https://t.me/${TELEGRAM_BOT}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Открыть Telegram-бота"
      className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
    </a>
  );
}
