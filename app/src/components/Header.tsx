import Link from "next/link";

const nav = [
  { href: "/", label: "Главная" },
  { href: "/services", label: "Услуги" },
  { href: "/masters", label: "Мастера" },
  { href: "/reviews", label: "Отзывы" },
  { href: "/contacts", label: "Контакты" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-black text-white">✂️</span>
          Парикмахерская
        </Link>
        <nav className="hidden gap-4 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm text-zinc-600 hover:text-black">{n.label}</Link>
          ))}
        </nav>
        <div className="flex gap-2">
          <a href="https://t.me/your_bot" target="_blank" className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">Записаться в Telegram</a>
          <Link href="/login" className="rounded border px-3 py-1.5 text-sm">Вход</Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-5xl gap-3 overflow-x-auto px-4 pb-2 md:hidden">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap text-sm text-zinc-600">{n.label}</Link>
        ))}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-10 border-t bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-zinc-500">
        <div>д. Примерово, ул. Центральная 1 · Ежедневно 09:00–19:00 · +7 900 000-00-00</div>
        <div className="mt-1">Данные берутся из БД (таблица knowledge_base) и редактируются в админке.</div>
      </div>
    </footer>
  );
}
