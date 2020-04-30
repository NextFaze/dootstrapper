load("//:tools/defaults.bzl", "gen_artifacts", "gen_bundle", "setup_ts_build", "setup_ts_specs")

setup_ts_build(
    name = "library",
    deps = [
        "//package:library",
    ],
)

setup_ts_specs(
    name = "specs",
    deps = [
        ":library",
    ],
)

gen_bundle(
    name = "example_bundle",
    deps = [
        ":library",
    ],
)

gen_artifacts(
    name = "example",
    srcs = [
        "buildspec.json",
        "cdk.json",
        "//:package.json",
        "//:package-lock.json",
    ],
    configs = {
        "dev": "config.dev.json",
        "uat": "config.uat.json",
        "prod": "config.prod.json",
    },
    deps = [
        ":example_bundle",
        "//package/handlers",
    ],
)
