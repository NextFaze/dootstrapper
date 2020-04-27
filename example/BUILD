load("//:tools/defaults.bzl", "gen_bundle", "setup_ts_build", "setup_ts_specs", "gen_artifacts")

setup_ts_build(
    name = "library",
    deps = [
        "//package:library"
    ]
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

gen_artifacts(
    name = "example",
    srcs = [
        "cdk.json",
        "buildspec.json",
        "//:package.json",
        "//:package-lock.json"
    ],
    configs = {
        'dev': 'config.dev.json'
    },
    deps = [
        ":example"
    ]
)


