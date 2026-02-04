import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const p = path.join(process.cwd(), "memory", "pending.json");
    const raw = fs.readFileSync(p, "utf8");
    const json = JSON.parse(raw);
    res.status(200).json({ ok: true, data: json, source: "memory/pending.json" });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? "failed" });
  }
}
