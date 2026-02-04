import type { VercelRequest, VercelResponse } from "@vercel/node";

type Conn = {
  name: string;
  ok: boolean;
  detail: string;
  latencyMs?: number;
};

async function timedFetch(url: string, init: RequestInit) {
  const t0 = Date.now();
  const r = await fetch(url, init);
  const t1 = Date.now();
  return { r, ms: t1 - t0 };
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const out: Conn[] = [];

  // GitHub
  {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      out.push({ name: "GitHub", ok: false, detail: "GITHUB_TOKEN absent" });
    } else {
      try {
        const { r, ms } = await timedFetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${token}`,
            "User-Agent": "mission-control",
            Accept: "application/vnd.github+json",
          },
        });
        out.push({
          name: "GitHub",
          ok: r.ok,
          latencyMs: ms,
          detail: r.ok ? "Token valide" : `HTTP ${r.status}`,
        });
      } catch (e: any) {
        out.push({ name: "GitHub", ok: false, detail: e?.message ?? "Erreur réseau" });
      }
    }
  }

  // OpenAI
  {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      out.push({ name: "OpenAI", ok: false, detail: "OPENAI_API_KEY absent" });
    } else {
      try {
        const { r, ms } = await timedFetch("https://api.openai.com/v1/models", {
          headers: {
            Authorization: `Bearer ${key}`,
          },
        });
        out.push({ name: "OpenAI", ok: r.ok, latencyMs: ms, detail: r.ok ? "Clé valide" : `HTTP ${r.status}` });
      } catch (e: any) {
        out.push({ name: "OpenAI", ok: false, detail: e?.message ?? "Erreur réseau" });
      }
    }
  }

  // Vercel
  {
    const token = process.env.VERCEL_TOKEN;
    if (!token) {
      out.push({ name: "Vercel", ok: false, detail: "VERCEL_TOKEN absent" });
    } else {
      try {
        const { r, ms } = await timedFetch("https://api.vercel.com/v2/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        out.push({ name: "Vercel", ok: r.ok, latencyMs: ms, detail: r.ok ? "Token valide" : `HTTP ${r.status}` });
      } catch (e: any) {
        out.push({ name: "Vercel", ok: false, detail: e?.message ?? "Erreur réseau" });
      }
    }
  }

  res.status(200).json({ ok: true, checkedAt: new Date().toISOString(), connections: out });
}
