"use client";
import { useEffect, useState } from "react";

type R = { id: number; text: string; rating: number; status: string; clientName?: string | null; createdAt: string };

export default function ReviewsClient() {
  const [items, setItems] = useState<R[]>([]);
  const [filter, setFilter] = useState("new");
  async function load() {
    const res = await fetch(`/api/reviews?status=${filter}`);
    const j = await res.json(); if (Array.isArray(j)) setItems(j);
  }
  useEffect(() => { load(); }, [filter]);
  async function upd(id: number, status: string) {
    await fetch(`/api/reviews/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); load();
  }
  async function del(id: number) {
    await fetch(`/api/reviews/${id}`, { method: "DELETE" }); load();
  }
  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded border px-2 py-1 text-sm">
          <option value="new">new</option><option value="published">published</option><option value="hidden">hidden</option><option value="">all</option>
        </select>
        <button onClick={load} className="rounded border px-3 py-1 text-sm">Обновить</button>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((r) => (
          <div key={r.id} className="rounded-xl border bg-white p-3">
            <div className="text-sm">{"★".repeat(r.rating)} · <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">{r.status}</span></div>
            <div className="mt-1 text-sm">{r.text}</div>
            <div className="mt-1 text-xs text-zinc-500">{r.clientName || "?"} · {new Date(r.createdAt).toLocaleString("ru-RU")}</div>
            <div className="mt-2 flex gap-1"><button onClick={() => upd(r.id, "published")} className="rounded bg-green-600 px-2 py-1 text-xs text-white">Опубликовать</button><button onClick={() => upd(r.id, "hidden")} className="rounded border px-2 py-1 text-xs">Скрыть</button><button onClick={() => del(r.id)} className="rounded bg-red-600 px-2 py-1 text-xs text-white">Удалить</button></div>
          </div>
        ))}
        {!items.length && <div className="rounded border bg-white p-4 text-sm text-zinc-500">Нет отзывов</div>}
      </div>
    </div>
  );
}
