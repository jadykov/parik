import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

const navAdmin = [
  { href: "/admin", label: "Дашборд", roles: ["admin", "employee"] },
  { href: "/admin/appointments", label: "Записи", roles: ["admin", "employee"] },
  { href: "/admin/reviews", label: "Отзывы", roles: ["admin", "employee"] },
  { href: "/admin/services", label: "Услуги", roles: ["admin"] },
  { href: "/admin/settings", label: "Настройки", roles: ["admin"] },
  { href: "/admin/dialogs", label: "Логи бота", roles: ["admin"] },
  { href: "/admin/employees", label: "Сотрудники", roles: ["admin"] }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserFromCookies();
  if (!user) redirect("/login");
  const filtered = navAdmin.filter((n) => n.roles.includes(user.role));
  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
      <aside className="w-48 shrink-0">
        <div className="rounded-xl border bg-white p-3">
          <div className="text-sm font-semibold">{user.name}</div>
          <div className="text-xs text-zinc-500">{user.login} · {user.role}</div>
          <nav className="mt-4 space-y-1">
            {filtered.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded px-2 py-1.5 text-sm hover:bg-zinc-100">{n.label}</Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <LogoutButton />
            <Link href="/" className="text-xs text-zinc-500 hover:text-black">← На сайт</Link>
          </div>
        </div>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
