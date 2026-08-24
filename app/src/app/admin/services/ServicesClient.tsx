"use client";
import { useEffect, useState } from "react";

type S = { id: number; title: string; price: number; durationMin: number; description?: string | null };

export default function ServicesClient() {
  const [items, setItems] = useState<S[]>([]);
  const [form, setForm] = useState({ title: "", price: "", durationMin: "", description: "" });
  const [editId, setEditId] = useState<number | null>(null);

  async function load() { const res = await fetch("/api/services"); const j = await res.json(); if (Array.isArray(j)) setItems(j); }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = { title: form.title, price: Number(form.price), durationMin: Number(form.durationMin), description: form.description || null };
    if (editId) await fetch(`/api/services/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    else await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setForm({ title: "", price: "", durationMin: "", description: "" }); setEditId(null); load();
  }

  function startEdit(s: S) { setEditId(s.id); setForm({ title: s.title, price: String(s.price), durationMin: String(s.durationMin), description: s.description || "" }); }

  async function del(id: number) { await fetch(`/api/services/${id}`, { method: "DELETE" }); load(); }

  return (
    <div className="mt-4">
      <form onSubmit={submit} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-4">
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Название" required className="rounded border px-2 py-1 text-sm" />
        <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Цена" type="number" required className="rounded border px-2 py-1 text-sm" />
        <input value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} placeholder="Мин" type="number" required className="rounded border px-2 py-1 text-sm" />
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Описание" className="rounded border px-2 py-1 text-sm" />
        <button type="submit" className="rounded bg-black px-3 py-1 text-sm text-white md:col-span-4">{editId ? "Сохранить" : "Добавить"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ title: "", price: "", durationMin: "", description: "" }); }} className="rounded border px-3 py-1 text-sm">Отмена</button>}
      </form>
      <div className="mt-3 overflow-auto rounded-xl border bg-white">
        <table className="w-full text-sm"><thead className="bg-zinc-50"><tr><th className="px-3 py-2 text-left">Услуга</th><th className="px-3 py-2">Цена</th><th className="px-3 py-2">Длит.</th><th className="px-3 py-2">Действия</th></tr></thead>
          <tbody>{items.map((s) => <tr key={s.id} className="border-t"><td className="px-3 py-2">{s.title}<div className="text-xs text-zinc-500">{s.description}</div></td><td className="px-3 py-2">{s.price} ₽</td><td className="px-3 py-2">{s.durationMin} мин</td><td className="px-3 py-2 flex gap-1"><button onClick={() => startEdit(s)} className="rounded border px-2 py-1 text-xs">Ред.</button><button onClick={() => del(s.id)} className="rounded bg-red-600 px-2 py-1 text-xs text-white">Удалить</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
