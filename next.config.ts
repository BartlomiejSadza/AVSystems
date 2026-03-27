import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Silence the workspace root detection warning
  outputFileTracingRoot: '/Users/bartlomiejsadza/repos/AVSystems',

  webpack(config) {
    // The simulator source files use Node ESM-style `.js` extensions in their
    // import statements (e.g. `import ... from './queue.js'`).  Webpack cannot
    // resolve those directly because the actual files on disk are `.ts`.
    // The `extensionAlias` option tells webpack that when it encounters a
    // request ending in `.js` it should also try `.ts` (and `.tsx`) before
    // giving up, which is the standard fix for TypeScript ESM projects.
    config.resolve = {
      ...config.resolve,
      extensionAlias: {
        '.js': ['.ts', '.tsx', '.js'],
        '.mjs': ['.mts', '.mjs'],
      },
    };
    return config;
  },
};

export default nextConfig;
