import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/main.tsx',
    // this is meant to be a library exposed to the user, so it is potentially used
    'src/lib/audio.ts',
    'src/lib/Musika/index.ts',
    // used by @vite-pwa/assets-generator
    'pwa-assets.config.ts',
    // for some reason Knip doesn't detect these module augmentations as used even though they are really needed
    'src/ace.d.ts',
    'src/define.d.ts',
    'test/globals.d.ts',
  ],
  project: ['**/*.{js,jsx,ts,tsx}'],
};

export default config;
