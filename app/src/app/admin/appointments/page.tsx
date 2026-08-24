import AppointmentsClient from "./AppointmentsClient";
export const dynamic = "force-dynamic";
export default function AppointmentsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">Записи</h1>
      <p className="text-sm text-zinc-500">Записи из Telegram-бота и сайта. Меняйте статус.</p>
      <AppointmentsClient />
    </div>
  );
}
