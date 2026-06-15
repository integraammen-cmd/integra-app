import WeeklyAgenda from "./components/WeeklyAgenda";

export default function Home() {
  const today = new Date();
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dateStr = `${days[today.getDay()]}, ${today.getDate()} de ${months[today.getMonth()]}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#0f1117] pb-20">
      <header className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">TU PANTALLAZO DIARIO</h1>
            <p className="text-sm text-zinc-400">{dateStr}</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button className="rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors">
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 space-y-5 px-5 py-4">
        <WeeklyAgenda />

        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-300 uppercase tracking-wider">ACCESOS RÁPIDOS</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink href="/matriz" icon="📊" label="Matriz de Costos" sub="Tarifas por socio" />
            <QuickLink href="/agenda" icon="📅" label="Calendario" sub="Semanal" />
            <QuickLink href="/briefing" icon="🤖" label="IA Chat" sub="Asistente" />
            <QuickLink href="/matriz/cargar" icon="⚙️" label="Ajustes" sub="Servicios" />
          </div>
        </section>
      </main>
    </div>
  );
}

function QuickLink({ href, icon, label, sub }: { href: string; icon: string; label: string; sub: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-xl bg-zinc-800/50 p-4 hover:bg-zinc-700/50 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-zinc-500">{sub}</p>
      </div>
    </a>
  );
}
