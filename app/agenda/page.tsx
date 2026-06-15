import DailyAgenda from "@/app/components/DailyAgenda";
export const dynamic = "force-dynamic";
export default function AgendaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <DailyAgenda />
    </div>
  );
}
