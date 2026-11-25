import { registerHooks } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const srcRoot = path.join(projectRoot, "src");

function resolveCandidate(basePath) {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const resolved = resolveCandidate(path.join(srcRoot, specifier.slice(2)));
      if (resolved) {
        return { url: resolved, shortCircuit: true };
      }
    }

    if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const resolved = resolveCandidate(path.resolve(parentDir, specifier));
      if (resolved) {
        return { url: resolved, shortCircuit: true };
      }
    }

    return nextResolve(specifier, context);
  },
});

