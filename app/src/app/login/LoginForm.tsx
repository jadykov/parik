"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [login, setLogin] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login, password }) });
    if (res.ok) router.push("/admin");
    else { const j = await res.json(); setErr(j.error || "Ошибка"); }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-3 rounded-xl border bg-white p-6">
      <h1 className="text-lg font-bold">Вход в админку</h1>
      {err && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
      <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Логин" className="w-full rounded border px-3 py-2 text-sm" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" className="w-full rounded border px-3 py-2 text-sm" />
      <button type="submit" className="w-full rounded bg-black py-2 text-sm text-white">Войти</button>
      <div className="text-xs text-zinc-400">По умолчанию admin / admin123 — смените в .env/seed</div>
    </form>
  );
}
