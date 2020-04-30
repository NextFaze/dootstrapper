load("//:tools/defaults.bzl", "setup_ts_build", "setup_ts_specs")

package(default_visibility = ["//visibility:public"])

setup_ts_build(
    name = "library",
)

setup_ts_specs(
    name = "specs",
    deps = [
        ":library",
    ],
)
