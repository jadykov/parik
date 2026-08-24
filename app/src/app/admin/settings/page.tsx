import SettingsClient from "./SettingsClient";
export const dynamic = "force-dynamic";
export default function SettingsPage() {
  return <div><h1 className="text-xl font-bold">Настройки (адрес/часы/телефон)</h1><p className="text-sm text-zinc-500">Только admin. Значения читает сайт и ИИ-бот.</p><SettingsClient /></div>;
}
