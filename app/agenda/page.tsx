import WeeklyCalendar from "../components/WeeklyCalendar";

export const dynamic = "force-dynamic";

export default function AgendaPage() {
  return (
    <div className="mx-auto max-w-6xl px-2 py-4 pb-24 bg-[#0f1117] min-h-screen">
      <WeeklyCalendar />
    </div>
  );
}
