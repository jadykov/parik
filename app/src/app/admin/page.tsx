import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  let stats = { newCount: 0, today: 0, reviewsNew: 0 };
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [newCount, todayCount, reviewsNew] = await Promise.all([
      prisma.appointment.count({ where: { status: "new" } }),
      prisma.appointment.count({ where: { date: today } }),
      prisma.review.count({ where: { status: "new" } })
    ]);
    stats = { newCount, today: todayCount, reviewsNew };
  } catch {}
  return (
    <div>
      <h1 className="text-xl font-bold">Дашборд</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4"><div className="text-sm text-zinc-500">Новые записи</div><div className="text-2xl font-bold">{stats.newCount}</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-sm text-zinc-500">На сегодня</div><div className="text-2xl font-bold">{stats.today}</div></div>
        <div className="rounded-xl border bg-white p-4"><div className="text-sm text-zinc-500">Отзывы на модерации</div><div className="text-2xl font-bold">{stats.reviewsNew}</div></div>
      </div>
      <p className="mt-4 text-sm text-zinc-500">Данные из БД в реальном времени (Prisma). Обновляются при каждой записи бота.</p>
    </div>
  );
}
