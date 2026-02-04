import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const indexPath = path.join(process.cwd(), "skills", "index.json");
    const raw = fs.readFileSync(indexPath, "utf8");
    const json = JSON.parse(raw) as { skills: string[] };
    const skills = (json.skills ?? []).slice().sort((a, b) => a.localeCompare(b));

    res.status(200).json({ ok: true, skills, source: "/skills/index.json" });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? "failed" });
  }
}
