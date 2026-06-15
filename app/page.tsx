import { createClient } from "@/app/lib/supabase-server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date();
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dateStr = `${days[today.getDay()]}, ${today.getDate()} de ${months[today.getMonth()]}`;

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
            <button className="rounded-full bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
              {user?.email?.split("@")[0]}
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 space-y-5 px-5 py-4">
        {/* Días de la semana */}
        <div className="flex gap-2 overflow-x-auto">
          {["Lun", "Mar", "Mié", "Hoy", "Vie", "Sáb", "Dom"].map((d, i) => (
            <button
              key={d}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                d === "Hoy"
                  ? "bg-[#1e3c72] text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {d === "Hoy" ? `Hoy ${today.getDate()}` : `${d} ${today.getDate() - 3 + i}`}
            </button>
          ))}
        </div>

        {/* TEMAS CLAVE DE HOY */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            TEMAS CLAVE DE HOY
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <TopicCard icon="🏥" label="Salud" color="emerald" />
            <TopicCard icon="👥" label="Sociales" color="blue" />
            <TopicCard icon="📋" label="Gremial" color="purple" />
          </div>
        </section>

        {/* INFORME MATUTINO */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            TU INFORME MATUTINO
          </h2>
          <div className="space-y-2">
            <BriefingRow icon="🎯" text="Revisar agenda de hoy y prioridades" />
            <BriefingRow icon="⚠️" text="Alertas pendientes de resolución" />
            <BriefingRow icon="📝" text="Seguimiento de trámites en curso" />
          </div>
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

function TopicCard({ icon, label, color }: { icon: string; label: string; color: string }) {
  const bgMap: Record<string, string> = {
    emerald: "bg-emerald-900/30 border-emerald-700/50",
    blue: "bg-blue-900/30 border-blue-700/50",
    purple: "bg-purple-900/30 border-purple-700/50",
  };
  return (
    <div className={`rounded-xl border p-3 text-center ${bgMap[color]}`}>
      <span className="text-2xl">{icon}</span>
      <p className="mt-1 text-xs font-medium text-zinc-300">{label}</p>
    </div>
  );
}

function BriefingRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-zinc-800/50 px-4 py-3">
      <span className="text-lg">{icon}</span>
      <p className="text-sm text-zinc-300">{text}</p>
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
