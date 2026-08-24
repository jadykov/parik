import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function ContactsPage() {
  let kb: Record<string, string> = {};
  try { const rows = await prisma.knowledgeBase.findMany(); kb = Object.fromEntries(rows.map((r) => [r.key, r.value])); } catch {}
  const address = kb.address || "д. Примерово, ул. Центральная 1";
  const hours = kb.work_hours || kb.hours || "Ежедневно 09:00–19:00";
  const phone = kb.phone || "+7 900 000-00-00";
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Контакты</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <div className="space-y-2 text-sm"><div>📍 <b>Адрес:</b> {address}</div><div>🕘 <b>Часы:</b> {hours}</div><div>📞 <b>Телефон:</b> <a href={`tel:${phone.replace(/[^+0-9]/g, "")}`} className="text-blue-600">{phone}</a></div></div>
          <a href="https://t.me/your_bot" target="_blank" className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white">Написать боту</a>
        </div>
        <div className="rounded-xl border bg-white p-2">
          <div className="flex h-64 items-center justify-center rounded bg-zinc-100 text-zinc-400">Карта (Яндекс/OpenStreetMap) — вставьте iframe</div>
        </div>
      </div>
    </div>
  );
}
