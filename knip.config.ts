import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      project: ['**/*.{js,jsx,ts,tsx}'],
    },
    'packages/app': {
      entry: [
        // used by @vite-pwa/assets-generator
        'pwa-assets.config.ts',
        // for some reason Knip doesn't detect these module augmentations as used even though they are really needed
        'src/ace.d.ts',
        'src/define.d.ts',
        'test/globals.d.ts',
      ],
      project: ['**/*.{js,jsx,ts,tsx}'],
    },
    'packages/audio': {
      entry: [
        // for some reason Knip doesn't detect these module augmentations as used even though they are really needed
        'test/globals.d.ts',
      ],
      project: ['**/*.{js,jsx,ts,tsx}'],
    },
    'packages/musika': {
      entry: [
        // for some reason Knip doesn't detect these module augmentations as used even though they are really needed
        'test/globals.d.ts',
      ],
      project: ['**/*.{js,jsx,ts,tsx}'],
    },
  },
};

export default config;
