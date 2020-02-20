load("//:tools/defaults.bzl", "gen_bundle", "setup_ts_build", "setup_ts_specs")

setup_ts_build(
    name = "library",
)

setup_ts_specs(
    name = "specs",
    deps = [
        ":library",
    ],
)

gen_bundle(
    name = "example",
    dir_name = "resources",
    deps = [
        ":library",
    ],
)
