"use client";
import { useEffect, useState } from "react";
type U = { id: number; login: string; role: string; name: string; createdAt: string };
export default function EmployeesClient() {
  const [items, setItems] = useState<U[]>([]);
  const [form, setForm] = useState({ login: "", password: "", name: "", role: "employee" });
  const [msg, setMsg] = useState<string | null>(null);
  async function load() { const res = await fetch("/api/users"); const j = await res.json(); if (Array.isArray(j)) setItems(j); }
  useEffect(() => { load(); }, []);
  async function create(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const j = await res.json(); if (res.ok) { setForm({ login: "", password: "", name: "", role: "employee" }); load(); } else setMsg(j.error || "Ошибка");
  }
  async function del(id: number) { const res = await fetch(`/api/users/${id}`, { method: "DELETE" }); if (res.ok) load(); else { const j = await res.json(); setMsg(j.error); } }
  return (
    <div className="mt-4">
      <form onSubmit={create} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-4">
        <input value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} placeholder="Логин" required className="rounded border px-2 py-1.5 text-sm" />
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Пароль" required className="rounded border px-2 py-1.5 text-sm" />
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Имя" required className="rounded border px-2 py-1.5 text-sm" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded border px-2 py-1.5 text-sm"><option value="employee">employee</option><option value="admin">admin</option></select>
        <button type="submit" className="rounded bg-black px-3 py-1.5 text-sm text-white md:col-span-4">Создать сотрудника</button>
      </form>
      {msg && <div className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</div>}
      <div className="mt-3 overflow-auto rounded-xl border bg-white">
        <table className="w-full text-sm"><thead className="bg-zinc-50"><tr><th className="px-3 py-2 text-left">Логин</th><th className="px-3 py-2">Имя</th><th className="px-3 py-2">Роль</th><th className="px-3 py-2">Действия</th></tr></thead>
          <tbody>{items.map((u) => <tr key={u.id} className="border-t"><td className="px-3 py-2">{u.login}</td><td className="px-3 py-2">{u.name}</td><td className="px-3 py-2">{u.role}</td><td className="px-3 py-2"><button onClick={() => del(u.id)} className="rounded bg-red-600 px-2 py-1 text-xs text-white">Удалить</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
