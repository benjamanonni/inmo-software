import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, createWriteStream } from "node:fs";
import { join } from "node:path";
const dockerDirectory =
  process.platform === "win32"
    ? join(
        process.env.LOCALAPPDATA,
        "Programs",
        "DockerDesktop",
        "resources",
        "bin",
      )
    : "";
if (dockerDirectory)
  process.env.PATH = dockerDirectory + ";" + process.env.PATH;
const docker =
  process.platform === "win32" ? join(dockerDirectory, "docker.exe") : "docker";
const run = async (command, args, log) => {
  const file = createWriteStream(log, { flags: "a" });
  const child = spawn(command, args, { windowsHide: true });
  child.stdout.pipe(file, { end: false });
  child.stderr.pipe(file, { end: false });
  const code = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  file.end();
  if (code !== 0)
    throw new Error(`Command failed; inspect the private log ${log}.`);
};
mkdirSync("artifacts", { recursive: true });
let dockerReady =
  spawnSync(docker, ["info"], { stdio: "ignore", windowsHide: true }).status ===
  0;
if (!dockerReady && process.platform === "win32") {
  const desktop = join(
    process.env.LOCALAPPDATA,
    "Programs",
    "DockerDesktop",
    "Docker Desktop.exe",
  );
  if (!existsSync(desktop)) throw new Error("Install Docker Desktop first.");
  const child = spawn(desktop, [], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
  for (let n = 0; n < 60 && !dockerReady; n++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    dockerReady =
      spawnSync(docker, ["info"], { stdio: "ignore", windowsHide: true })
        .status === 0;
  }
}
if (!dockerReady)
  throw new Error("Docker is not ready. Open Docker Desktop and try again.");
console.log("Docker ready. Starting persistent local services…");
if (process.platform === "win32")
  await run(
    "cmd.exe",
    ["/d", "/s", "/c", "npx supabase start --exclude vector,logflare"],
    "artifacts/local-start.log",
  );
else
  await run(
    "npx",
    ["supabase", "start", "--exclude", "vector,logflare"],
    "artifacts/local-start.log",
  );
if (!existsSync(".env.n8n.local"))
  throw new Error(
    "Missing private n8n configuration. Follow docs/deployment.md.",
  );
await run(
  docker,
  [
    "compose",
    "--env-file",
    ".env.n8n.local",
    "-f",
    "automation/n8n/compose.yaml",
    "up",
    "-d",
  ],
  "artifacts/local-start.log",
);
console.log("Supabase ready. n8n: http://127.0.0.1:5678");
if (!process.argv.includes("--services-only")) {
  if (!existsSync(".env.local"))
    throw new Error(
      "Configure public frontend keys in .env.local before starting Crook.",
    );
  console.log("Starting Crook connected to the local database…");
  const child =
    process.platform === "win32"
      ? spawn("cmd.exe", ["/d", "/s", "/c", "npm run dev:live"], {
          stdio: "inherit",
          windowsHide: true,
        })
      : spawn("npm", ["run", "dev:live"], { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code ?? 0));
}
