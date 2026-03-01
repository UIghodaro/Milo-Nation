/**
 * FounderOS Backend
 *
 * Serves expert MD content and roadmap-developer content. All .md files
 * live under content/; collaborators fill them in. This server only reads
 * and returns their contents via API.
 */
import express from "express";
import cors from "cors";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CONTENT_DIR = resolve(__dirname, "content");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Helpers ─────────────────────────────────────────────────────────────
async function readMd(relativePath) {
  const fullPath = join(CONTENT_DIR, relativePath);
  try {
    const raw = await readFile(fullPath, "utf-8");
    return { ok: true, content: raw };
  } catch (err) {
    if (err.code === "ENOENT") return { ok: false, error: "not_found" };
    return { ok: false, error: err.message };
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────

/**
 * GET /api/expert/:trackId/:moduleId
 * Returns the content of content/expert_mds/{trackId}/{moduleId}.md
 * Used by the frontend or AI layer to inject module expert guidance into chat.
 */
app.get("/api/expert/:trackId/:moduleId", async (req, res) => {
  const { trackId, moduleId } = req.params;
  const relativePath = join("expert_mds", trackId, `${moduleId}.md`);
  const result = await readMd(relativePath);
  if (!result.ok) {
    return res.status(result.error === "not_found" ? 404 : 500).json({
      error: result.error,
      path: relativePath,
    });
  }
  res.type("text/markdown").send(result.content);
});

/**
 * GET /api/roadmap-developer
 * Returns the content of content/Roadmap_Developer.md
 * Inputs: founder profile, goal, progress, list of uploaded assets.
 * Outputs: (1) personalised roadmap (track IDs + start/end), (2) material-to-track mapping.
 */
app.get("/api/roadmap-developer", async (req, res) => {
  const result = await readMd("Roadmap_Developer.md");
  if (!result.ok) {
    return res.status(result.error === "not_found" ? 404 : 500).json({
      error: result.error,
      path: "Roadmap_Developer.md",
    });
  }
  res.type("text/markdown").send(result.content);
});

/**
 * GET /api/workspace/:trackId/:moduleId/summary
 * Returns saved chat summary for a module (content/workspace/{trackId}/{moduleId}_summary.md).
 * Collaborator or app can write these; this endpoint only reads.
 */
app.get("/api/workspace/:trackId/:moduleId/summary", async (req, res) => {
  const { trackId, moduleId } = req.params;
  const relativePath = join("workspace", trackId, `${moduleId}_summary.md`);
  const result = await readMd(relativePath);
  if (!result.ok) {
    return res.status(result.error === "not_found" ? 404 : 500).json({
      error: result.error,
      path: relativePath,
    });
  }
  res.type("text/markdown").send(result.content);
});

/**
 * POST /api/workspace/:trackId/:moduleId/summary
 * Body: { "content": "markdown string" }
 * Writes content/workspace/{trackId}/{moduleId}_summary.md for session memory.
 */
app.post("/api/workspace/:trackId/:moduleId/summary", async (req, res) => {
  const { trackId, moduleId } = req.params;
  const content = req.body?.content ?? "";
  const relativePath = join("workspace", trackId, `${moduleId}_summary.md`);
  const fullPath = join(CONTENT_DIR, relativePath);
  try {
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, "utf-8");
    res.json({ ok: true, path: relativePath });
  } catch (err) {
    res.status(500).json({ error: err.message, path: relativePath });
  }
});

/**
 * GET /api/health
 * Simple health check.
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "founder-os-backend" });
});

/**
 * GET /api/content-list
 * Returns list of expert MD paths (trackId/moduleId) for discovery.
 */
app.get("/api/content-list", async (req, res) => {
  const { readdir } = await import("fs/promises");
  const expertDir = join(CONTENT_DIR, "expert_mds");
  const list = [];
  try {
    const tracks = await readdir(expertDir, { withFileTypes: true });
    for (const t of tracks) {
      if (!t.isDirectory()) continue;
      const modules = await readdir(join(expertDir, t.name), { withFileTypes: true });
      for (const m of modules) {
        if (m.isFile() && m.name.endsWith(".md"))
          list.push({ trackId: t.name, moduleId: m.name.replace(/\.md$/, "") });
      }
    }
  } catch (e) {
    // expert_mds might not exist yet
  }
  res.json({ expertModules: list });
});

// ─── Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`FounderOS backend listening on http://localhost:${PORT}`);
  console.log(`  GET /api/health`);
  console.log(`  GET /api/roadmap-developer`);
  console.log(`  GET /api/expert/:trackId/:moduleId`);
  console.log(`  GET /api/workspace/:trackId/:moduleId/summary`);
  console.log(`  GET /api/content-list`);
});
