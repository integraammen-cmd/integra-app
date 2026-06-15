import { createClient } from "@/app/lib/supabase-server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dateStr = `${days[today.getDay()]}, ${today.getDate()} de ${months[today.getMonth()]}`;

  // Fetch today's events
  const { data: todayEvents } = user ? await supabase
    .from("events")
    .select("*")
    .eq("user_id", user.id)
    .gte("start_time", `${todayStr}T00:00:00Z`)
    .lte("start_time", `${todayStr}T23:59:59Z`)
    .order("start_time", { ascending: true })
    : { data: [] };

  return (
    <div className="flex min-h-screen flex-col bg-[#0f1117] pb-20">
      {/* Header */}
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
        {/* Agenda del día */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            📅 AGENDA DE HOY
          </h2>
          {todayEvents && todayEvents.length > 0 ? (
            <div className="space-y-1.5">
              {todayEvents.map((event: Record<string, unknown>) => (
                <div key={event.id as string} className="flex items-center gap-3 rounded-lg bg-zinc-800/50 border border-zinc-700 px-4 py-3">
                  <span className="text-sm font-mono text-[#1e3c72] min-w-[4rem]">
                    {new Date(event.start_time as string).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_BADGE[event.category as string] || "bg-zinc-700 text-zinc-300"}`}>
                    {event.category as string}
                  </span>
                  <span className="text-sm text-zinc-200 flex-1">{event.title as string}</span>
                  {(event.alarm_enabled as boolean) && <span>🔔</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 px-1">Sin eventos programados para hoy</p>
          )}
        </section>

        {/* ACCESOS RÁPIDOS */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            ACCESOS RÁPIDOS
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink href="/matriz" icon="📊" label="Matriz de Costos" sub="Tarifas por socio" />
            <QuickLink href="/agenda" icon="📅" label="Calendario" sub="Eventos del día" />
            <QuickLink href="/briefing" icon="🤖" label="IA Chat" sub="Asistente matutino" />
            <QuickLink href="/matriz/cargar" icon="⚙️" label="Ajustes" sub="Carga de servicios" />
          </div>
        </section>
      </main>
    </div>
  );
}

const CATEGORY_BADGE: Record<string, string> = {
  salud: "bg-emerald-900/50 text-emerald-300",
  sociales: "bg-blue-900/50 text-blue-300",
  gremial: "bg-purple-900/50 text-purple-300",
  admin: "bg-zinc-700 text-zinc-300",
  urgente: "bg-red-900/50 text-red-300",
};

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
