/**
 * Free port 3000 + drop locked .next/trace, then start next dev.
 * Avoids: stale 500 on :3000, and EPERM when a second next tries :3001.
 */
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const isWin = process.platform === "win32";

function sleepMs(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

/** Run PowerShell; pass secrets/paths via extraEnv, not string concat. */
function runPs(command, extraEnv) {
  execSync(`powershell -NoProfile -Command ${JSON.stringify(command)}`, {
    stdio: "ignore",
    env: extraEnv ? { ...process.env, ...extraEnv } : undefined,
  });
}

function freePort(port) {
  const p = Number(port);
  try {
    if (isWin) {
      runPs(
        `Get-NetTCPConnection -LocalPort ${p} -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -gt 0) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }`,
      );
      return;
    }
    const pids = execSync(`lsof -ti:${p}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    for (const pid of pids) {
      try {
        process.kill(Number(pid), "SIGKILL");
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* nothing listening */
  }
}

function killProjectNext() {
  if (!isWin) return;
  try {
    runPs(
      "$m = $env:DX_ROOT; Get-CimInstance Win32_Process -Filter \"name='node.exe'\" | Where-Object { $_.CommandLine -and $m -and $_.CommandLine.Contains($m) -and $_.CommandLine -match 'next' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }",
      { DX_ROOT: root },
    );
  } catch {
    /* empty */
  }
}

function dropTrace() {
  const trace = path.join(root, ".next", "trace");
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      fs.unlinkSync(trace);
      return;
    } catch (err) {
      if (err?.code === "ENOENT") return;
      if (attempt < 2) {
        sleepMs(200);
        continue;
      }
      console.warn("dev:fresh: could not remove .next/trace:", err.code || err.message);
    }
  }
}

freePort(3000);
killProjectNext();
dropTrace();

const child = spawn(isWin ? "npx.cmd" : "npx", ["next", "dev"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});
child.on("exit", (code) => process.exit(code ?? 0));
