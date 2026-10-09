import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The React Compiler memoizes components for us, so no manual useMemo/useCallback.
  reactCompiler: true,
  cacheComponents: true,
  partialPrefetching: true,
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
