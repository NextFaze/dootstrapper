load("@npm_bazel_rollup//:index.bzl", "rollup_bundle")
load("//:tools/defaults.bzl", "setup_ts_build", "setup_ts_specs")
load("@rules_pkg//:pkg.bzl", "pkg_tar")


package(default_visibility = ["//visibility:public"])

setup_ts_build(
    name = "library"
)

setup_ts_specs(
    name = "specs",
    deps = [
        ":library",
    ],
)

rollup_bundle(
    name = "bundle",
    sourcemap = 'hidden',
    config_file = "rollup.config.js",
    entry_point = ":index.ts",
    format = "cjs",
    deps = [
        ":library",
    ],
)

pkg_tar(
    name = "handlers",
    srcs = [
        ":bundle",
    ],
    extension = "tar.gz",
    package_dir = "handlers",
)
