#!/usr/bin/env node

import path from 'node:path';
import sharp from 'sharp';

const pathCwd = process.cwd();
const pathPublicSrc = path.join(pathCwd, 'public-src');
const pathPublic = path.join(pathCwd, 'public');

await Promise.all([
  sharp(path.join(pathPublicSrc, 'lambda-musika-og-center.svg'))
    .png()
    .toFile(path.join(pathPublic, 'lambda-musika-og-center.png')),
  sharp(path.join(pathPublicSrc, 'lambda-musika-twitter.svg'))
    .png()
    .toFile(path.join(pathPublic, 'lambda-musika-twitter.png')),
]);
