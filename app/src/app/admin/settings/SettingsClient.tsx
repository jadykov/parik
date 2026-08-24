"use client";
import { useEffect, useState } from "react";

export default function SettingsClient() {
  const [rows, setRows] = useState<Record<string, string>>({ address: "", phone: "", work_hours: "" });
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/knowledge"); const j = await res.json();
    if (Array.isArray(j)) { const m: Record<string, string> = {}; j.forEach((r: any) => m[r.key] = r.value); setRows({ address: m.address || "", phone: m.phone || "", work_hours: m.work_hours || m.hours || "" }); }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    const payload = [{ key: "address", value: rows.address }, { key: "phone", value: rows.phone }, { key: "work_hours", value: rows.work_hours }];
    const res = await fetch("/api/knowledge", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setMsg(res.ok ? "Сохранено" : "Ошибка");
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border bg-white p-4">
      <label className="block text-sm">Адрес<input value={rows.address} onChange={(e) => setRows({ ...rows, address: e.target.value })} className="mt-1 w-full rounded border px-3 py-1.5" /></label>
      <label className="block text-sm">Телефон<input value={rows.phone} onChange={(e) => setRows({ ...rows, phone: e.target.value })} className="mt-1 w-full rounded border px-3 py-1.5" /></label>
      <label className="block text-sm">Часы работы<input value={rows.work_hours} onChange={(e) => setRows({ ...rows, work_hours: e.target.value })} className="mt-1 w-full rounded border px-3 py-1.5" /></label>
      <button onClick={save} className="rounded bg-black px-4 py-2 text-sm text-white">Сохранить</button>
      {msg && <div className="text-sm text-zinc-600">{msg}</div>}
    </div>
  );
}
