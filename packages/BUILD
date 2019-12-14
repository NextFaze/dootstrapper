package(default_visibility = ["//visibility:public"])

load("@npm_bazel_typescript//:index.bzl", "ts_library")
load("@npm_bazel_jasmine//:index.bzl", "jasmine_node_test")


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
        "@npm//:node_modules",
    ],
)
