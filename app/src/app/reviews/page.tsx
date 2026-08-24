import { prisma } from "@/lib/prisma";
import ReviewForm from "./ReviewForm";
export const dynamic = "force-dynamic";
export default async function ReviewsPage() {
  let reviews: any[] = [];
  try { reviews = await prisma.review.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" } }); } catch {}
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Отзывы</h1>
      <p className="mt-1 text-sm text-zinc-500">Оставьте отзыв через форму или ботом в Telegram — публикуем после проверки.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-semibold">Оставить отзыв</h2>
          <ReviewForm />
          <p className="mt-2 text-xs text-zinc-400">Или напишите боту «Оставить отзыв».</p>
        </div>
        <div>
          <h2 className="font-semibold">Отзывы клиентов</h2>
          <div className="mt-3 space-y-3">
            {reviews.length ? reviews.map((r) => (
              <div key={r.id} className="rounded-xl border bg-white p-4">
                <div className="text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                <div className="mt-1 text-sm text-zinc-700">{r.text}</div>
                <div className="mt-1 text-xs text-zinc-400">{r.clientName || "Гость"} · {new Date(r.createdAt).toLocaleDateString("ru-RU")}</div>
              </div>
            )) : <div className="rounded border bg-white p-4 text-sm text-zinc-500">Пока нет отзывов — станьте первым!</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
