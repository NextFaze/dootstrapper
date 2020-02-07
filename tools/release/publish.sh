
#!/usr/bin/env bash
set -u -e -o pipefail

echo "Publishing..."

# Use for production releases
# Query Bazel for npm_package and ng_package rules with tags=["lib-release"]
# Publish them to npm (tagged next)
# We need to resolve the Bazel binary in the node modules because running Bazel
# through `npm bazel` causes additional output that throws off the command stdout.
BAZEL_BIN=$(npm bin)/bazel
# Build into a distinct output location so that artifacts from previous builds are not reused
BAZEL_OUTPUT_BASE=$(mktemp -d -t doostrapper-release.xxxxxx)
BAZEL="$BAZEL_BIN --output_base=$BAZEL_OUTPUT_BASE"


# query for all npm packages to be released as part of the framework release
NPM_PACKAGE_LABELS=`${BAZEL_BIN} query --output=label 'attr("tags", "\[.*lib-release.*\]", //...)'`
# # build all npm packages in parallel
# $BAZEL build --config=release $NPM_PACKAGE_LABELS
# # publish all packages in sequence to make it easier to spot any errors or warnings
# for packageLabel in $NPM_PACKAGE_LABELS; do
#   echo "publishing $packageLabel"
#   $BAZEL run --config=release -- ${packageLabel}.publish --access public --tag latest
# done
