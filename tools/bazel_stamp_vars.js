#!/usr/bin/env node
const execSync = require('child_process').execSync;
process.on('uncaughtException', function(err) {
  console.error('Failed to execute:,', process.argv.join(' '));
  console.error(err);
});

const BUILD_SCM_HASH = _exec(`git rev-parse HEAD`);
console.log(`BUILD_SCM_HASH: ${BUILD_SCM_HASH}`);

const currentTag = _exec(`git tag`);
if (!currentTag) {
  console.error(`No git tags found, can't stamp the build.`);
  console.error('Please fetch the tags first:');
  console.error(
    '       git fetch git@github.com:NextFaze/dootstrapper.git --tags'
  );
  return;
}

const BUILD_SCM_VERSION_RAW = _exec(
  `git describe --match [0-9].[0-9].[0-9]* --abbrev=7 --tags HEAD`
);

const BUILD_SCM_VERSION = BUILD_SCM_VERSION_RAW.replace(
  /-([0-9]+)-g/,
  '+$1.sha-'
);
console.log(`BUILD_SCM_VERSION ${BUILD_SCM_VERSION}`);

function _exec(command) {
  return execSync(command)
    .toString()
    .trim();
}
