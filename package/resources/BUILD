package(default_visibility = ["//visibility:public"])

load("//:index.bzl", "setup_ts_build", "setup_ts_specs")

setup_ts_build(
    name = "library",
)

setup_ts_specs(
    name = "specs",
    deps = [
        ":library",
    ],
)
