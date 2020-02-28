package(default_visibility = ["//visibility:public"])
load("//:index.bzl", "setup_ts_build")
load("@build_bazel_rules_nodejs//:index.bzl", "pkg_npm")

setup_ts_build(
    name = "library",
    srcs = [
        "index.ts"
        ],
    deps = [
        "//handlers:library",
        "//resources:library",
    ],
)

pkg_npm(
    name = "doostrapper",
    srcs = [
        "LICENCE",
        "README.public.md",
        "package.json",
        ":library"
    ],
    substitutions = {
        "./resources/enums":"./enums"
    },
    replace_with_version = "0.0.0-PLACEHOLDER",
    # deps = [
    #     ":library",
    # ],
)
