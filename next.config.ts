import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  typedRoutes: true,
  outputFileTracingRoot: workspaceRoot
};

export default nextConfig;
