import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const skillsDir = path.join(process.cwd(), "skills");
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    const skills = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({ ok: true, skills, source: "/skills" });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? "failed" });
  }
}
