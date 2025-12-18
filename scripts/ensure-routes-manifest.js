// Create a minimal routes-manifest.json when Turbopack skips generating it.
const fs = require("node:fs");
const path = require("node:path");

const distDirs = Array.from(
  new Set([process.env.NEXT_DIST_DIR, ".next", ",next"].filter(Boolean)),
);

const manifestPaths = distDirs.map((distDir) =>
  path.join(process.cwd(), distDir, "routes-manifest.json"),
);

if (manifestPaths.some((p) => fs.existsSync(p))) {
  process.exit(0);
}

const manifest = {
  version: 3,
  routes: [],
  dynamicRoutes: [],
  preview: {
    previewModeId: "preview-mode-id",
    previewModeSigningKey: "preview-mode-signing-key",
    previewModeEncryptionKey: "preview-mode-encryption-key",
  },
  basePath: "",
  headers: [],
  redirects: [],
  rewrites: { beforeFiles: [], afterFiles: [], fallback: [] },
  staticRoutes: [],
  dataRoutes: [],
  dynamicRoutesV3: [],
  appUseFileSystemPublicRoutes: true,
  localeDetection: true,
  trailingSlash: false,
  pages404: true,
  ssg404: true,
};

for (const manifestPath of manifestPaths) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Generated stub routes manifest at ${manifestPath}`);
}
