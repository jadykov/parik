import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [services, knowledge, reviews] = await Promise.all([
      prisma.service.findMany({ orderBy: { price: "asc" } }),
      prisma.knowledgeBase.findMany(),
      prisma.review.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 3 })
    ]);
    const kb = Object.fromEntries(knowledge.map((k) => [k.key, k.value]));
    return { services, kb, reviews };
  } catch {
    return { services: [], kb: {} as Record<string, string>, reviews: [] };
  }
}

export default async function Home() {
  const { services, kb, reviews } = await getData();
  const address = kb.address || "д. Примерово, ул. Центральная 1";
  const hours = kb.work_hours || kb.hours || "Ежедневно 09:00–19:00";
  const phone = kb.phone || "+7 900 000-00-00";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <section className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-700 p-8 text-white">
        <h1 className="text-3xl font-bold">Деревенская парикмахерская — стрижем с душой ✂️</h1>
        <p className="mt-3 max-w-2xl text-zinc-200">Мужские, женские и детские стрижки. Без записи — приходите, но лучше через бота. Поток небольшой, принимаем быстро.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="https://t.me/your_bot" target="_blank" className="rounded bg-white px-5 py-2.5 font-medium text-black">Записаться в Telegram-боте</a>
          <a href="/services" className="rounded border border-white px-5 py-2.5 text-white">Цены</a>
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-zinc-300">
          <span>📍 {address}</span><span>🕘 {hours}</span><span>📞 {phone}</span>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Популярные услуги</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.length ? services.slice(0, 4).map((s) => (
            <div key={s.id} className="rounded-xl border bg-white p-4">
              <div className="font-medium">{s.title}</div>
              <div className="text-sm text-zinc-500">{s.description}</div>
              <div className="mt-2 text-lg font-bold">{s.price} ₽</div>
              <div className="text-xs text-zinc-400">{s.durationMin} мин</div>
            </div>
          )) : <div className="rounded border bg-white p-4 text-zinc-500">Цены загружаются из БД (таблица services). Запустите seed.</div>}
        </div>
        <a href="/services" className="mt-3 inline-block text-sm text-blue-600">Все услуги →</a>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold">Как записаться</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-600">
            <li>Нажмите «Записаться в Telegram»</li><li>Бот спросит имя/телефон/услугу/дату/время</li><li>Запись появится в админке, админ подтвердит</li>
          </ol>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold">Отзывы</h3>
          {reviews.length ? <ul className="mt-2 space-y-2 text-sm">{reviews.map((r) => <li key={r.id} className="rounded bg-zinc-50 p-2">{"★".repeat(r.rating)} — {r.text.slice(0, 80)}</li>)}</ul> : <p className="mt-2 text-sm text-zinc-500">Нет отзывов — оставьте первый на странице Отзывы.</p>}
          <a href="/reviews" className="mt-2 inline-block text-sm text-blue-600">Все отзывы →</a>
        </div>
      </section>
    </div>
  );
}
