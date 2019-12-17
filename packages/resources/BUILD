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

ts_library(
    name = "e2e",
    testonly = True,
    srcs = glob([
        "**/*.spec.ts",
    ]),
    data = glob([
        "test/**/*.json",
    ]),
    tsconfig = "//:tsconfig.json",
    deps = [
        ":library",
        "@npm//:node_modules",
    ],
)

jasmine_node_test(
    name = "test",
    size = "small",
    srcs = [":e2e"],
    install_source_map_support = True,
    deps = [
        "@npm//source-map-support",
    ],
)
