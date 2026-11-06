import { spawnSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["supabase", "gen", "types", "typescript", "--local"],
  { encoding: "utf8", shell: process.platform === "win32" },
);
if (result.status !== 0)
  throw new Error(
    "Supabase type generation failed; existing contracts were not overwritten. Start the local stack first.",
  );
if (!result.stdout.includes("export type Database"))
  throw new Error("Unexpected output; types not written.");
await writeFile(
  "src/integrations/supabase/database.generated.ts",
  result.stdout,
);
console.log(
  "Types generated from local schema. Review them against boundary validators before committing.",
);
