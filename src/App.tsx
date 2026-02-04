import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import NasaMissionControlScene from "./scene/NasaMissionControlScene";

type Conn = { name: string; ok: boolean; detail: string; latencyMs?: number };

type Pending = {
  pending_from_boss?: Array<{ id: number; item: string; requested?: string; status?: string }>;
  reminders?: Array<any>;
};

type SubAgents = { sessions?: Array<any> };

type Crons = { crons?: Array<{ name: string; schedule: string; status: string; source?: string }> };

const SECTIONS = ["🧠 Skills", "🔗 Connexions", "🚧 Manques", "📋 Projets", "🤖 Sub-agents", "⏰ Crons"] as const;

function cls(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className={cls("rounded-2xl p-4 md:p-5", "glass", "text-white", "shadow-glow")}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm md:text-base font-semibold tracking-wide text-white/90">{title}</h2>
      </div>
      <div className="mt-3 text-sm text-white/80">{children}</div>
    </motion.section>
  );
}

function Divider() {
  return <div className="h-px w-full bg-white/10 my-2" />;
}

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span className={cls("text-xs", ok ? "text-emerald-200" : "text-amber-200")}>{ok ? "OK" : "Warning"}</span>
  );
}

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as T;
}

export default function App() {
  const [dark, setDark] = useState(true);

  const [skills, setSkills] = useState<string[] | null>(null);
  const [connections, setConnections] = useState<Conn[] | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [subAgents, setSubAgents] = useState<SubAgents | null>(null);
  const [crons, setCrons] = useState<Crons | null>(null);

  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mc_theme");
    if (saved) setDark(saved === "dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("mc_theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sk, con, pr, sa, cr] = await Promise.all([
          getJson<{ ok: boolean; skills: string[] }>("/api/skills"),
          getJson<{ ok: boolean; connections: Conn[] }>("/api/connections"),
          getJson<{ ok: boolean; data: Pending }>("/api/projects"),
          getJson<{ ok: boolean; data: SubAgents }>("/api/subagents"),
          getJson<{ ok: boolean; data: Crons }>("/api/crons"),
        ]);

        if (cancelled) return;
        setSkills(sk.skills);
        setConnections(con.connections);
        setPending(pr.data);
        setSubAgents(sa.data);
        setCrons(cr.data);
        setErr(null);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Erreur de chargement");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = useMemo(() => new Date().toUTCString().replace("GMT", "UTC"), []);

  return (
    <div className={cls("min-h-screen w-full", dark ? "bg-black" : "bg-slate-50")}>
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0.2, 7.5], fov: 55, near: 0.1, far: 240 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <NasaMissionControlScene mode={dark ? "dark" : "light"} />
          <AdaptiveDpr pixelated />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 min-h-screen dashboard-content">
        <header className="px-4 md:px-8 pt-4 md:pt-6">
          <div className={cls("mx-auto max-w-6xl rounded-2xl px-4 md:px-6 py-4", dark ? "glass" : "glassLight", dark ? "text-white" : "text-slate-900")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={cls("text-xs", dark ? "text-white/60" : "text-slate-600")}>Mission Control V16 — NASA Mission Control</div>
                <div className="mt-1 text-xl md:text-2xl font-semibold tracking-tight">Flight Operations Console</div>
                <div className={cls("mt-1 text-xs", dark ? "text-white/50" : "text-slate-600")}>{now}</div>
              </div>

              <button
                onClick={() => setDark((v) => !v)}
                className={cls(
                  "rounded-xl px-3 py-2 text-xs font-medium",
                  dark ? "bg-white/10 hover:bg-white/15 text-white" : "bg-black/10 hover:bg-black/15 text-slate-900"
                )}
                aria-label="Toggle theme"
              >
                <span className="inline-flex items-center gap-2">{dark ? <Moon size={16} /> : <Sun size={16} />}{dark ? "Dark" : "Light"}</span>
              </button>
            </div>

            <Divider />

            <div className={cls("grid grid-cols-2 md:grid-cols-6 gap-2 text-xs", dark ? "text-white/70" : "text-slate-700")}>
              {SECTIONS.map((s) => (
                <div key={s} className="truncate">{s}</div>
              ))}
            </div>
          </div>
        </header>

        <main className="px-4 md:px-8 pb-8 pt-4 md:pt-6">
          <div className="mx-auto max-w-6xl">
            {err ? (
              <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
                Données non chargées: {err}
              </div>
            ) : null}

            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <Card title="🧠 Skills">
                  <div className="flex items-center justify-between">
                    <span>Skills détectés</span>
                    <span className="font-semibold">{skills ? skills.length : "…"}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    {(skills ?? []).map((k) => (
                      <div key={k} className="rounded-lg bg-white/5 px-2 py-1">{k}</div>
                    ))}
                  </div>
                  <div className="mt-2 text-[11px] text-white/50">Source: /skills/ (server-side)</div>
                </Card>

                <Card title="🔗 Connexions">
                  <ul className="space-y-2">
                    {(connections ?? []).map((c) => (
                      <li key={c.name} className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-white/60">
                            {c.detail}{typeof c.latencyMs === "number" ? ` — ${c.latencyMs} ms` : ""}
                          </div>
                        </div>
                        <StatusPill ok={c.ok} />
                      </li>
                    ))}
                    {!connections ? <div className="text-xs text-white/60">Chargement…</div> : null}
                  </ul>
                  <div className="mt-2 text-[11px] text-white/50">Vérification serverless (tokens via variables d’environnement).</div>
                </Card>

                <Card title="🚧 Manques">
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between">
                      <span>Logs centralisés</span>
                      <span className="text-xs text-white/50">À mettre en place</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Alerting (Pager/Slack)</span>
                      <span className="text-xs text-white/50">À brancher</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Snapshots réguliers</span>
                      <span className="text-xs text-white/50">À planifier</span>
                    </li>
                  </ul>
                </Card>

                <Card title="📋 Projets">
                  <div className="space-y-2">
                    {(pending?.pending_from_boss ?? []).length === 0 ? (
                      <div className="text-xs text-white/60">Aucun item en attente.</div>
                    ) : (
                      (pending?.pending_from_boss ?? []).map((p) => (
                        <div key={p.id} className="rounded-xl bg-white/5 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="font-medium text-sm">{p.item}</div>
                            <div className="text-xs text-white/60">#{p.id}</div>
                          </div>
                          <div className="mt-1 text-xs text-white/60">
                            {p.status ? `Statut: ${p.status}` : ""}{p.requested ? ` • Demandé: ${p.requested}` : ""}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-2 text-[11px] text-white/50">Source: memory/pending.json</div>
                </Card>

                <Card title="🤖 Sub-agents">
                  <div className="space-y-2">
                    {(subAgents?.sessions ?? []).length === 0 ? (
                      <div className="text-xs text-white/60">Historique vide (memory/sessions.json).</div>
                    ) : (
                      (subAgents?.sessions ?? []).map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span>{s.name ?? "session"}</span>
                          <span className="text-xs text-white/60">{s.status ?? ""}</span>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card title="⏰ Crons">
                  <ul className="space-y-2">
                    {(crons?.crons ?? []).map((c) => (
                      <li key={c.name} className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-white/60">{c.schedule}</div>
                        </div>
                        <span className="text-xs text-white/70">{c.status}</span>
                      </li>
                    ))}
                    {!crons ? <div className="text-xs text-white/60">Chargement…</div> : null}
                  </ul>
                  <div className="mt-2 text-[11px] text-white/50">Source: crons/active.json</div>
                </Card>
              </div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
