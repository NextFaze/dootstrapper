package(default_visibility = ["//visibility:public"])

load("@npm_bazel_typescript//:index.bzl", "ts_library")
load("@npm_bazel_jasmine//:index.bzl", "jasmine_node_test")
load("@npm_bazel_rollup//:index.bzl", "rollup_bundle")
load("@rules_pkg//:pkg.bzl", "pkg_zip")

ts_library(
    name = "library",
    srcs = glob(
        [
            "**/*.ts",
        ],
        exclude = ["**/*.spec.ts"],
    ),
    tsconfig = "//:tsconfig.json",
    deps = [
        "//packages/resources:library",
        "@npm//:node_modules",
    ],
)

rollup_bundle(
    name = "resources",
    srcs = [
        "//:package.json",
    ],
    config_file = "//:rollup.config.js",
    entry_point = ":index.ts",
    format = "cjs",    
    deps = [
        ":library",
        "//packages/resources:library",
        "@npm//:node_modules",
    ],
)

pkg_zip(
    name = "latest",
    extension = "zip",
    package_dir = "test",
    srcs = [
        ":resources",
        "//:package.json",
        "cdk.json"
    ]

)