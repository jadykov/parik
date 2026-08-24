"use client";
import { useState } from "react";

export default function ReviewForm() {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, rating, clientName: name || null }) });
    if (res.ok) { setMsg("Спасибо! Отзыв на модерации."); setText(""); setName(""); } else { const j = await res.json(); setMsg(j.error || "Ошибка"); }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-xl border bg-white p-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя (необязательно)" className="w-full rounded border px-3 py-2 text-sm" />
      <textarea value={text} onChange={(e) => setText(e.target.value)} required placeholder="Ваш отзыв" rows={3} className="w-full rounded border px-3 py-2 text-sm" />
      <div className="flex items-center gap-2 text-sm">
        Оценка: <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="rounded border px-2 py-1">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}</select>
      </div>
      <button type="submit" className="w-full rounded bg-black py-2 text-sm text-white">Отправить</button>
      {msg && <div className="text-sm text-zinc-600">{msg}</div>}
    </form>
  );
}
