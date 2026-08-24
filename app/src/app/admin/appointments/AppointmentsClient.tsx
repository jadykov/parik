"use client";
import { useEffect, useState } from "react";

type Appt = { id: number; clientName: string; clientPhone: string; date: string; time: string; status: string; service?: { title: string } | null; clientTelegramUsername?: string | null; createdAt: string };

export default function AppointmentsClient() {
  const [items, setItems] = useState<Appt[]>([]);
  const [filter, setFilter] = useState("");
  const [date, setDate] = useState("");

  async function load() {
    const q = new URLSearchParams();
    if (filter) q.set("status", filter);
    if (date) q.set("date", date);
    const res = await fetch(`/api/appointments?${q.toString()}`);
    const j = await res.json();
    if (Array.isArray(j)) setItems(j);
  }
  useEffect(() => { load(); }, [filter, date]);

  async function setStatus(id: number, status: string) {
    await fetch(`/api/appointments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded border px-2 py-1 text-sm">
          <option value="">Все</option><option value="new">new</option><option value="confirmed">confirmed</option><option value="done">done</option><option value="canceled">canceled</option>
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded border px-2 py-1 text-sm" />
        <button onClick={load} className="rounded border px-3 py-1 text-sm">Обновить</button>
      </div>
      <div className="mt-3 overflow-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50"><tr><th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-left">Клиент</th><th className="px-3 py-2">Услуга</th><th className="px-3 py-2">Дата</th><th className="px-3 py-2">Статус</th><th className="px-3 py-2">Действия</th></tr></thead>
          <tbody>{items.map((a) => <tr key={a.id} className="border-t"><td className="px-3 py-2">{a.id}</td><td className="px-3 py-2"><div>{a.clientName}</div><div className="text-xs text-zinc-500">{a.clientPhone} {a.clientTelegramUsername ? `(@${a.clientTelegramUsername})` : ""}</div></td><td className="px-3 py-2">{a.service?.title || "—"}</td><td className="px-3 py-2">{a.date} {a.time}</td><td className="px-3 py-2"><span className="rounded bg-zinc-100 px-2 py-0.5 text-xs">{a.status}</span></td><td className="px-3 py-2 flex gap-1"><button onClick={() => setStatus(a.id, "confirmed")} className="rounded bg-green-600 px-2 py-1 text-xs text-white">Подтв.</button><button onClick={() => setStatus(a.id, "done")} className="rounded bg-black px-2 py-1 text-xs text-white">Готово</button><button onClick={() => setStatus(a.id, "canceled")} className="rounded border px-2 py-1 text-xs">Отмена</button></td></tr>)}</tbody>
        </table>
        {!items.length && <div className="p-4 text-center text-sm text-zinc-500">Нет записей</div>}
      </div>
    </div>
  );
}
