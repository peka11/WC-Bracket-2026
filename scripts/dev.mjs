#!/usr/bin/env node
import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
const nextDir = path.join(root, ".next");
const PORT = process.env.PORT ?? "3000";

function killPort(port) {
  try {
    const pids = execSync(`lsof -ti:${port}`, { encoding: "utf8" }).trim();
    if (pids) {
      for (const pid of pids.split("\n")) {
        try {
          process.kill(Number(pid), "SIGKILL");
        } catch {
          /* already gone */
        }
      }
      console.log(`[dev] Stopped previous process on port ${port}`);
    }
  } catch {
    /* port free */
  }
}

function nextCacheLooksCorrupt() {
  if (!fs.existsSync(nextDir)) return false;

  const required = [
    path.join(nextDir, "server", "webpack-runtime.js"),
    path.join(nextDir, "server", "app"),
  ];

  for (const file of required) {
    if (!fs.existsSync(file)) return true;
  }

  // Missing vendor chunks after hot reload (e.g. @supabase) → 500 / e[o] is not a function
  const vendorDir = path.join(nextDir, "server", "vendor-chunks");
  if (fs.existsSync(vendorDir)) {
    const vendors = fs.readdirSync(vendorDir);
    const serverApp = path.join(nextDir, "server", "app");
    if (fs.existsSync(serverApp)) {
      const needsSupabase = walkDir(serverApp).some((f) => {
        try {
          return fs.readFileSync(f, "utf8").includes("@supabase");
        } catch {
          return false;
        }
      });
      if (needsSupabase && !vendors.some((v) => v.includes("supabase"))) {
        return true;
      }
    }
  }

  const staticDir = path.join(nextDir, "static");
  if (fs.existsSync(staticDir)) {
    const cssDir = path.join(staticDir, "css");
    if (!fs.existsSync(cssDir)) return true;
  }

  return false;
}

function walkDir(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkDir(p));
    else if (entry.name.endsWith(".js")) out.push(p);
  }
  return out;
}

const shouldClean =
  process.argv.includes("--clean") ||
  process.env.DEV_CLEAN === "1" ||
  nextCacheLooksCorrupt();

killPort(PORT);

if (shouldClean && fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("[dev] Cleared .next cache (stale or corrupt build detected)");
}

const child = spawn("npx", ["next", "dev", "-p", PORT], {
  stdio: "inherit",
  shell: true,
  cwd: root,
});

child.on("exit", (code) => process.exit(code ?? 0));
