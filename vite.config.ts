/// <reference types="vitest" />
/// <reference types="node" />

import ViteReact from '@vitejs/plugin-react';
import { exec } from 'node:child_process';
import process from 'node:process';
import util from 'node:util';
import { defineConfig, loadEnv, type UserConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import ViteSvgr from 'vite-plugin-svgr';
import * as packageJson from './package.json';

// https://vite.dev/config/
export default defineConfig(async ({ mode }): Promise<UserConfig> => {
  const env = loadEnv(mode, process.cwd(), '');
  const gitCommit = (
    await util.promisify(exec)('git rev-parse --short HEAD')
  ).stdout.trim();

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- we want to default to '/' if BASE is empty string too
  const base = env['BASE'] || '/';

  return {
    base,
    plugins: [
      ViteReact(),
      ViteImageOptimizer(),
      ViteMinifyPlugin(),
      ViteSvgr(),
    ],
    define: {
      'import.meta.env.GIT_COMMIT_SHORT_SHA': JSON.stringify(gitCommit),
      'import.meta.env.PACKAGE_DESCRIPTION': JSON.stringify(
        packageJson.description,
      ),
      'import.meta.env.PACKAGE_HOMEPAGE': JSON.stringify(packageJson.homepage),
      'import.meta.env.PACKAGE_CONFIG_NAME': JSON.stringify(
        packageJson.config.name,
      ),
      'import.meta.env.PACKAGE_CONFIG_SHORT_NAME': JSON.stringify(
        packageJson.config.shortName,
      ),
      'import.meta.env.PACKAGE_CONFIG_DESCRIPTION': JSON.stringify(
        packageJson.config.description,
      ),
      'import.meta.env.PACKAGE_CONFIG_AUTHOR': JSON.stringify(
        packageJson.config.author,
      ),
      'import.meta.env.PACKAGE_CONFIG_THEME_COLOR': JSON.stringify(
        packageJson.config.themeColor,
      ),
      'import.meta.env.PACKAGE_CONFIG_URL': JSON.stringify(
        packageJson.config.url,
      ),
      'import.meta.env.PACKAGE_CONFIG_PUBLIC_URL_BASE': JSON.stringify(
        packageJson.config.publicUrlBase,
      ),
      'import.meta.env.PACKAGE_CONFIG_REPOSITORY_URL': JSON.stringify(
        packageJson.config.repositoryUrl,
      ),
    },
    build: {
      // include sourcemaps even in prod... we are opensource after all, and this might help people debug issues
      sourcemap: true,
      // slower but slightly smaller output... and we don't build often
      minify: 'terser',
      rollupOptions: {
        output: {
          // output node_modules stuff into a vendor chunk since it will presumably not change often and can be cached
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }

            return null;
          },
        },
      },
    },
    test: {
      globals: true,
    },
  };
});
