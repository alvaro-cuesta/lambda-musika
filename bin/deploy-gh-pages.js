#!/usr/bin/env node

'use strict';

const path = require('path');
const ghpages = require('gh-pages');

ghpages.publish(path.join(__dirname, '..', 'build'), {
  message: `v${process.env.npm_package_version}`,
  logger: function(message) {
    process.stderr.write(message + '\n');
  }
}, function(err) {
  if (err) {
    process.stderr.write(err.message + '\n');
    return process.exit(1);
  }
  process.stderr.write('Published\n');
});
