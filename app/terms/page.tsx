import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Пользовательское соглашение",
  description: "Условия использования сайта Begov Corporation и общие условия оказания услуг по подбору и доставке автомобилей.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Пользовательское соглашение</h1>
      <p className="mt-3 text-sm text-muted">Последнее обновление: {new Date().toLocaleDateString("ru-RU")}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">1. Общие положения</h2>
          <p className="mt-3">
            Этот сайт (begov-corporation.vercel.app) принадлежит и управляется Begov Corporation.{" "}
            <span className="text-accent">
              [Юридическое название, регистрационный номер и юридический адрес компании — уточняются
              и будут добавлены сюда]
            </span>
            . Используя сайт и оставляя заявки, вы соглашаетесь с условиями ниже.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">2. Что сайт делает, а что нет</h2>
          <p className="mt-3">
            Сайт предоставляет справочную информацию (каталог, калькулятор, проверку по VIN) и
            принимает заявки на подбор и доставку автомобилей. Цены калькулятора и на карточках
            каталога — ориентировочные; итоговая стоимость, сроки и точные условия сделки
            фиксируются отдельно, в договоре с менеджером, до оплаты.
          </p>
          <p className="mt-3">
            Проверка по VIN использует открытую базу NHTSA (США) и показывает только заводские
            характеристики автомобиля — не историю ДТП, пробега или владения. Фото и отчеты по
            истории конкретного автомобиля предоставляются по отдельному запросу через менеджера
            и не гарантированы для каждого VIN.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">3. Договор на услуги</h2>
          <p className="mt-3">
            Фактическая сделка по подбору, выкупу и доставке автомобиля оформляется отдельным
            договором между вами и Begov Corporation вне рамок этого сайта. Условия оплаты, сроков
            и ответственности сторон определяются этим договором, а не текстами на страницах сайта.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">4. Личный кабинет</h2>
          <p className="mt-3">
            Регистрируя аккаунт, вы обязуетесь указывать достоверные контактные данные и несёте
            ответственность за сохранность пароля. Мы вправе ограничить доступ к аккаунту при
            подозрении на его несанкционированное использование.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">5. Ограничение ответственности</h2>
          <p className="mt-3">
            Информация на сайте (сроки доставки, ориентировочные цены, описания услуг) приводится
            для общего ознакомления и может отличаться от фактических условий конкретной сделки.
            Мы стремимся к точности, но не гарантируем отсутствие отдельных неточностей на
            справочных страницах — актуальные условия всегда уточняйте у менеджера перед оплатой.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">6. Персональные данные</h2>
          <p className="mt-3">
            Обработка персональных данных, которые вы оставляете на сайте, описана в{" "}
            <a href="/privacy" className="font-semibold text-accent hover:underline">
              Политике конфиденциальности
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">7. Изменения условий</h2>
          <p className="mt-3">
            Мы можем обновлять эту страницу — актуальная версия условий всегда доступна по этому
            адресу.
          </p>
        </section>
      </div>
    </div>
  );
}
