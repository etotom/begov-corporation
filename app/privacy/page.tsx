import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Как Begov Corporation собирает, использует и хранит персональные данные посетителей и клиентов сайта.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Политика конфиденциальности</h1>
      <p className="mt-3 text-sm text-muted">Последнее обновление: {new Date().toLocaleDateString("ru-RU")}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">1. Кто обрабатывает ваши данные</h2>
          <p className="mt-3">
            Данные, которые вы оставляете на этом сайте (begov-corporation.vercel.app), обрабатывает
            компания Begov Corporation (Грузия, Тбилиси).{" "}
            <span className="text-accent">
              [Юридическое название, регистрационный номер и юридический адрес компании — уточняются
              и будут добавлены сюда]
            </span>
            . По вопросам обработки данных пишите на контакты, указанные на странице «Контакты».
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">2. Какие данные мы собираем</h2>
          <p className="mt-3">При использовании сайта мы можем получать:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Имя, телефон, страну и текст обращения — если вы оставляете заявку (подбор авто, расчет доставки, запрос по VIN, контактная форма).</li>
            <li>Имя, email, телефон, страну и пароль (в зашифрованном виде) — если вы создаете личный кабинет.</li>
            <li>VIN-код автомобиля, который вы вводите для проверки — используется только для запроса к базе NHTSA (США) и не передается третьим лицам, кроме самого запроса к NHTSA.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">3. Зачем мы используем данные</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Чтобы связаться с вами по оставленной заявке и рассчитать стоимость подбора/доставки автомобиля.</li>
            <li>Чтобы вести ваш личный кабинет и историю ваших заявок.</li>
            <li>Чтобы улучшать работу сайта и каталога.</li>
          </ul>
          <p className="mt-3">Мы не продаем и не передаем ваши персональные данные третьим лицам в рекламных целях.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">4. Где хранятся данные</h2>
          <p className="mt-3">
            Сайт и база данных размещены на инфраструктуре Vercel и Neon (серверы в США/ЕС).
            Это означает, что данные посетителей — в том числе из Таджикистана, Узбекистана,
            Казахстана, Кыргызстана и России — обрабатываются и хранятся за пределами этих стран.
            Оставляя заявку, вы соглашаетесь на такую трансграничную передачу данных для целей,
            описанных в разделе 3.
          </p>
          <p className="mt-3">
            Если вы находитесь в России: обращаем внимание, что законодательство РФ о персональных
            данных может требовать хранения персональных данных граждан России на серверах,
            расположенных на территории России. Мы работаем над приведением обработки данных
            российских пользователей в соответствие с этим требованием; если это для вас критично —
            уточните у менеджера актуальный статус перед тем, как оставлять персональные данные.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">5. Ваши права</h2>
          <p className="mt-3">
            Вы можете запросить у нас информацию о том, какие данные о вас хранятся, попросить их
            исправить или удалить — напишите на контакты, указанные на странице «Контакты». Мы
            ответим в разумный срок.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">6. Cookies</h2>
          <p className="mt-3">
            Сайт использует один технический cookie-файл для входа в личный кабинет (сессия
            авторизации). Рекламных и аналитических cookie-файлов третьих лиц сайт не использует.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">7. Изменения политики</h2>
          <p className="mt-3">
            Мы можем обновлять эту страницу — актуальная версия всегда доступна по этому адресу.
          </p>
        </section>
      </div>
    </div>
  );
}
