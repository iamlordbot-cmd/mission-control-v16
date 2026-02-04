import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import NasaMissionControlScene from "./scene/NasaMissionControlScene";

const SECTIONS = [
  "🧠 Skills",
  "🔗 Connexions",
  "🚧 Manques",
  "📋 Projets",
  "🤖 Sub-agents",
  "🔋 Santé système",
  "⏰ Crons",
  "🔒 Sécurité",
] as const;

function cls(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function MockTag() {
  return <span className="ml-1 text-xs text-white/40 dark:text-white/40">(mock)</span>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className={cls(
        "rounded-2xl p-4 md:p-5",
        "glass dark:glass",
        "text-white",
        "shadow-glow"
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm md:text-base font-semibold tracking-wide text-white/90">
          {title}
        </h2>
      </div>
      <div className="mt-3 text-sm text-white/80">{children}</div>
    </motion.section>
  );
}

function Divider() {
  return <div className="h-px w-full bg-white/10 my-2" />;
}

export default function App() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("mc_theme");
    if (saved) setDark(saved === "dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("mc_theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const now = useMemo(() => new Date().toUTCString().replace("GMT", "UTC"), []);

  return (
    <div className={cls("min-h-screen w-full", dark ? "bg-black" : "bg-slate-50")}>
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0.2, 7.5], fov: 55, near: 0.1, far: 200 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <NasaMissionControlScene mode={dark ? "dark" : "light"} />
          <AdaptiveDpr pixelated />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 min-h-screen dashboard-content">
        <header className="px-4 md:px-8 pt-4 md:pt-6">
          <div
            className={cls(
              "mx-auto max-w-6xl rounded-2xl px-4 md:px-6 py-4",
              dark ? "glass" : "glassLight",
              dark ? "text-white" : "text-slate-900"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={cls("text-xs", dark ? "text-white/60" : "text-slate-600")}>
                  Mission Control V16 — NASA Mission Control
                </div>
                <div className="mt-1 text-xl md:text-2xl font-semibold tracking-tight">
                  Flight Operations Console
                </div>
                <div className={cls("mt-1 text-xs", dark ? "text-white/50" : "text-slate-600")}>
                  {now}
                </div>
              </div>

              <button
                onClick={() => setDark((v) => !v)}
                className={cls(
                  "rounded-xl px-3 py-2 text-xs font-medium",
                  dark
                    ? "bg-white/10 hover:bg-white/15 text-white"
                    : "bg-black/10 hover:bg-black/15 text-slate-900"
                )}
                aria-label="Toggle theme"
              >
                <span className="inline-flex items-center gap-2">
                  {dark ? <Moon size={16} /> : <Sun size={16} />}
                  {dark ? "Dark" : "Light"}
                </span>
              </button>
            </div>

            <Divider />

            <div className={cls("grid grid-cols-2 md:grid-cols-4 gap-2 text-xs", dark ? "text-white/70" : "text-slate-700")}>
              {SECTIONS.map((s) => (
                <div key={s} className="truncate">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </header>

        <main className="px-4 md:px-8 pb-8 pt-4 md:pt-6">
          <div className="mx-auto max-w-6xl">
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <Card title="🧠 Skills">
                  <div className="flex items-center justify-between">
                    <span>Skills actifs</span>
                    <span className="font-semibold">12 <MockTag /></span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    {["grok-search", "whisper", "elevenlabs-tts", "browser", "nodes", "cron"].map((k) => (
                      <div key={k} className="rounded-lg bg-white/5 px-2 py-1">
                        {k} <MockTag />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="🔗 Connexions">
                  <ul className="space-y-2">
                    <li className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">OpenAI</div>
                        <div className="text-xs text-white/60">
                          ⚠️ Limite de débit atteinte sur un endpoint (mock). Action: activer backoff + surveiller 429.
                        </div>
                      </div>
                      <span className="text-xs text-amber-200">Warning <MockTag /></span>
                    </li>
                    <li className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">Vercel</div>
                        <div className="text-xs text-white/60">
                          ✅ Déploiements actifs (mock). Action: aucune.
                        </div>
                      </div>
                      <span className="text-xs text-emerald-200">OK <MockTag /></span>
                    </li>
                    <li className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">GitHub</div>
                        <div className="text-xs text-white/60">
                          ⚠️ Checks CI désactivés sur un repo (mock). Action: réactiver les workflows + protéger la branche main.
                        </div>
                      </div>
                      <span className="text-xs text-amber-200">Warning <MockTag /></span>
                    </li>
                  </ul>
                </Card>

                <Card title="🚧 Manques">
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between">
                      <span>Logs centralisés</span>
                      <span className="text-xs text-white/50">Non configuré <MockTag /></span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Alerting (Pager/Slack)</span>
                      <span className="text-xs text-white/50">À brancher <MockTag /></span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Snapshots réguliers</span>
                      <span className="text-xs text-white/50">À planifier <MockTag /></span>
                    </li>
                  </ul>
                </Card>

                <Card title="📋 Projets">
                  <div className="space-y-2">
                    {[
                      { name: "Mission Control", pct: 78 },
                      { name: "Agent Tooling", pct: 54 },
                      { name: "Ops Automations", pct: 33 },
                    ].map((p) => (
                      <div key={p.name}>
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            {p.name} <MockTag />
                          </span>
                          <span className="text-xs text-white/60">{p.pct}% <MockTag /></span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300/80 to-fuchsia-300/80" style={{ width: `${p.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="🤖 Sub-agents">
                  <div className="space-y-2">
                    {[
                      { name: "Builder", status: "Actif" },
                      { name: "QA", status: "En attente" },
                      { name: "Deploy", status: "Actif" },
                    ].map((a) => (
                      <div key={a.name} className="flex items-center justify-between">
                        <span>
                          {a.name} <MockTag />
                        </span>
                        <span className="text-xs text-white/60">
                          {a.status} <MockTag />
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="🔋 Santé système">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xs text-white/60">CPU</div>
                      <div className="mt-1 font-semibold">42% <MockTag /></div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xs text-white/60">RAM</div>
                      <div className="mt-1 font-semibold">7.2 GB <MockTag /></div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xs text-white/60">Latence</div>
                      <div className="mt-1 font-semibold">118 ms <MockTag /></div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="text-xs text-white/60">Uptime</div>
                      <div className="mt-1 font-semibold">3d 11h <MockTag /></div>
                    </div>
                  </div>
                </Card>

                <Card title="⏰ Crons">
                  <ul className="space-y-2">
                    <li className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">heartbeat</div>
                        <div className="text-xs text-white/60">*/30 * * * * <MockTag /></div>
                      </div>
                      <span className="text-xs text-emerald-200">OK <MockTag /></span>
                    </li>
                    <li className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">daily-report</div>
                        <div className="text-xs text-white/60">0 9 * * * <MockTag /></div>
                      </div>
                      <span className="text-xs text-white/60">Suspendu <MockTag /></span>
                    </li>
                  </ul>
                </Card>

                <Card title="🔒 Sécurité">
                  <ul className="space-y-2">
                    <li className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">Secrets</div>
                        <div className="text-xs text-white/60">
                          ⚠️ Un secret est en clair dans un .env local. Action: migrer vers Vercel Env + rotation.
                        </div>
                      </div>
                      <span className="text-xs text-amber-200">Warning <MockTag /></span>
                    </li>
                    <li className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">Dépendances</div>
                        <div className="text-xs text-white/60">✅ Audit OK. Action: aucune.</div>
                      </div>
                      <span className="text-xs text-emerald-200">OK <MockTag /></span>
                    </li>
                  </ul>
                </Card>
              </div>
            </AnimatePresence>

            <div className={cls("mt-5 text-center text-xs", dark ? "text-white/40" : "text-slate-500")}>
              UI + metrics: démo showroom. Toutes les valeurs marquées <span className="text-white/60">(mock)</span> sont fictives.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
