import fs from "node:fs";
import path from "node:path";
import { importContentPackage } from "../services/content/contentImportService";

function parseArgs(argv: string[]) {
  let filePath = "";
  let dryRun = false;
  let allowPublishedUpdate = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--allow-published-update") {
      allowPublishedUpdate = true;
    } else if (!arg.startsWith("--") && !filePath) {
      filePath = arg;
    }
  }

  return { filePath, dryRun, allowPublishedUpdate };
}

async function main() {
  const { filePath, dryRun, allowPublishedUpdate } = parseArgs(process.argv.slice(2));

  if (!filePath) {
    console.error(
      "Usage: node --experimental-strip-types src/scripts/importContent.ts <path-to-package.json> [--dry-run] [--allow-published-update]"
    );
    process.exitCode = 1;
    return;
  }

  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Package file not found: ${resolvedPath}`);
    process.exitCode = 1;
    return;
  }

  let parsed: unknown;
  try {
    const raw = fs.readFileSync(resolvedPath, "utf8");
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(
      `Failed to parse JSON package: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exitCode = 1;
    return;
  }

  const result = await importContentPackage(parsed, {
    dryRun,
    allowPublishedUpdate,
  });

  console.log(JSON.stringify(result, null, 2));

  if (!result.preview.canProceed || (!dryRun && !result.applied)) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

