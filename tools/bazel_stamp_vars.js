#!/usr/bin/env bash
const execSync = require('child_process').execSync;

// Setup crash handler
process.on('uncaughtException', onError);

const BUILD_SCM_HASH = _exec(`git rev-parse HEAD`);
console.log(`BUILD_SCM_HASH ${BUILD_SCM_HASH}`);

if (_exec(`git tag`) == '') {
  console.error(`No git tags found, can't stamp the build.`);
  console.error('Please fetch the tags first:');
}

// Find out if there are any uncommitted local changes
const LOCAL_CHANGES =
  _exec(`git status --untracked-files=no --porcelain`) != '';
console.log(`BUILD_SCM_LOCAL_CHANGES ${LOCAL_CHANGES}`);

// Only match the latest tag that is a version such as 6.0.0, 6.0.0-rc.5, etc...
// This will ignore non-version tags which would break unit tests expecting a valid version
// number in the package headers
const BUILD_SCM_VERSION_RAW = _exec(
  `git describe --match [0-9].[0-9].[0-9]* --abbrev=7 --tags HEAD`
);

// Reformat `git describe` version string into a more semver-ish string
//   From:   5.2.0-rc.0-57-g757f886
//   To:     5.2.0-rc.0+57.sha-757f886
//   Or:     5.2.0-rc.0+57.sha-757f886.with-local-changes
const BUILD_SCM_VERSION =
  BUILD_SCM_VERSION_RAW.replace(/-([0-9]+)-g/, '+$1.sha-') +
  (LOCAL_CHANGES ? '.with-local-changes' : '');
console.log(`BUILD_SCM_VERSION ${BUILD_SCM_VERSION}`);

function _exec(str) {
  return execSync(str)
    .toString()
    .trim();
}

function onError() {
  console.error('Failed to execute:,', process.argv.join(' '));
  console.error('');
}
