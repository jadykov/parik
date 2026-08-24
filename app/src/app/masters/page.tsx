export default function MastersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Мастера</h1>
      <p className="mt-1 text-sm text-zinc-500">Деревенская парикмахерская — уют и знакомые лица.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { name: "Елена", role: "Женский мастер", exp: "10 лет" },
          { name: "Алексей", role: "Мужской мастер / барбер", exp: "7 лет" },
          { name: "Администратор", role: "Запись и консультации — бот + телефон", exp: "" }
        ].map((m) => (
          <div key={m.name} className="rounded-xl border bg-white p-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl">✂️</div>
            <div className="mt-3 font-semibold">{m.name}</div>
            <div className="text-sm text-zinc-500">{m.role}</div>
            {m.exp && <div className="text-xs text-zinc-400">Опыт {m.exp}</div>}
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-zinc-500">При записи через бота можно указать мастера — админ учтет пожелание.</p>
    </div>
  );
}
