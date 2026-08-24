import DialogsClient from "./DialogsClient";
export const dynamic = "force-dynamic";
export default function DialogsPage() {
  return <div><h1 className="text-xl font-bold">Логи бота</h1><DialogsClient /></div>;
}
