// [FIX v0.2.1]: Calendario wrapper — Integra Mutual brand identity
import WeeklyCalendar from "../components/WeeklyCalendar";

export const dynamic = "force-dynamic";

export default function AgendaPage() {
  return (
    <div className="page-container" style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <WeeklyCalendar />
    </div>
  );
}
