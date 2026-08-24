import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function ServicesPage() {
  let services: any[] = [];
  try { services = await prisma.service.findMany({ orderBy: { price: "asc" } }); } catch {}
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Услуги и цены</h1>
      <p className="mt-1 text-sm text-zinc-500">Цены из БД (таблица services). Меняются в админке.</p>
      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left"><tr><th className="px-4 py-2">Услуга</th><th className="px-4 py-2">Описание</th><th className="px-4 py-2">Длит.</th><th className="px-4 py-2">Цена</th></tr></thead>
          <tbody>{services.map((s) => <tr key={s.id} className="border-t"><td className="px-4 py-3 font-medium">{s.title}</td><td className="px-4 py-3 text-zinc-500">{s.description || "—"}</td><td className="px-4 py-3">{s.durationMin} мин</td><td className="px-4 py-3 font-bold">{s.price} ₽</td></tr>)}</tbody>
        </table>
        {!services.length && <div className="p-6 text-center text-zinc-500">Нет услуг — запустите <code>npx prisma db seed</code></div>}
      </div>
      <a href="https://t.me/your_bot" target="_blank" className="mt-6 inline-block rounded bg-blue-600 px-5 py-2.5 text-white">Записаться через бота</a>
    </div>
  );
}
