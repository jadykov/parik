"use client";
import { useEffect, useState } from "react";
type D = { id: number; telegramId: string; messageUser: string; messageBot?: string | null; intent?: string | null; createdAt: string };
export default function DialogsClient() {
  const [items, setItems] = useState<D[]>([]);
  async function load() { const res = await fetch("/api/dialogs?limit=100"); const j = await res.json(); if (Array.isArray(j)) setItems(j); }
  useEffect(() => { load(); }, []);
  return (
    <div className="mt-4">
      <button onClick={load} className="rounded border px-3 py-1 text-sm">Обновить</button>
      <div className="mt-3 space-y-2">
        {items.map((d) => (
          <div key={d.id} className="rounded-xl border bg-white p-3 text-sm">
            <div className="flex gap-2 text-xs text-zinc-500"><span>#{d.id}</span><span>tg:{d.telegramId}</span><span>{d.intent || "other"}</span><span>{new Date(d.createdAt).toLocaleString("ru-RU")}</span></div>
            <div className="mt-1"><b>Юзер:</b> {d.messageUser}</div>
            {d.messageBot && <div className="text-zinc-600"><b>Бот:</b> {d.messageBot}</div>}
          </div>
        ))}
        {!items.length && <div className="rounded border bg-white p-4 text-sm text-zinc-500">Нет логов</div>}
      </div>
    </div>
  );
}
