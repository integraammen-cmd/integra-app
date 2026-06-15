import { createClient } from "@/app/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-[#1e3c72]">Integra</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">{user?.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button className="text-sm text-red-600 hover:underline">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DashboardCard
            title="Matriz de Costos"
            description="Servicios y tarifas por tipo de socio"
            href="/matriz"
            color="blue"
          />
          <DashboardCard
            title="Agenda Diaria"
            description="Eventos y reuniones del día"
            href="/agenda"
            color="green"
          />
          <DashboardCard
            title="Briefing Matutino"
            description="Informe ejecutivo diario"
            href="/briefing"
            color="amber"
          />
        </div>

        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-zinc-500">Dashboard en construcción</p>
          <p className="mt-1 text-sm text-zinc-400">
            Los módulos se habilitarán en los próximos pasos del desarrollo.
          </p>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  color,
}: {
  title: string;
  description: string;
  href: string;
  color: "blue" | "green" | "amber";
}) {
  const borderColor = {
    blue: "border-l-[#1e3c72]",
    green: "border-l-[#2ecc71]",
    amber: "border-l-amber-500",
  }[color];

  return (
    <a
      href={href}
      className={`rounded-lg border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${borderColor}`}
    >
      <h3 className="font-semibold text-zinc-800">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </a>
  );
}
