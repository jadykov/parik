import EmployeesClient from "./EmployeesClient";
export const dynamic = "force-dynamic";
export default function EmployeesPage() {
  return <div><h1 className="text-xl font-bold">Сотрудники</h1><p className="text-sm text-zinc-500">Только admin создает/удаляет. Employee видит только Записи и Отзывы.</p><EmployeesClient /></div>;
}
