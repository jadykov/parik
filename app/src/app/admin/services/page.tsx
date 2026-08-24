import ServicesClient from "./ServicesClient";
export const dynamic = "force-dynamic";
export default function AdminServicesPage() {
  return <div><h1 className="text-xl font-bold">Услуги (прайс)</h1><p className="text-sm text-zinc-500">Только admin. Меняет цены на сайте и для ИИ-бота.</p><ServicesClient /></div>;
}
