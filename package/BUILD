load("@build_bazel_rules_nodejs//:index.bzl", "pkg_npm")
load("//:tools/defaults.bzl", "setup_ts_build")

package(default_visibility = ["//visibility:public"])

exports_files(
    [
        "package.json",
        "package-lock.json",
    ],
)

setup_ts_build(
    name = "library",
    module_name = "@nf-tools/dootstrapper",
    deps = [
        "//package/handlers:library",
        "//package/resources:library",
    ],
)

pkg_npm(
    name = "dootstrapper",
    srcs = [
        "LICENCE",
        "README.md",
        "package.json",
    ],
    replace_with_version = "0.0.0-PLACEHOLDER",
    substitutions = {
        "dootstrapper/package": "@nf-tools/dootstrapper",
    },
    deps = [
        ":library",
    ],
)
