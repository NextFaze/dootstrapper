load("@npm_bazel_typescript//:index.bzl", "ts_library")
load("@npm_bazel_jasmine//:index.bzl", "jasmine_node_test")

def setup_ts_build(name, deps = []):
    """ Sets up default build configuration to compile ts sources with npm hosted deps
    """

    ts_library(
        name = name,
        srcs = native.glob(
            [
                "**/*.ts",
            ],
            exclude = ["**/*.spec.ts"],
        ),
        tsconfig = "//:tsconfig.json",
        deps = deps + [
            "@npm//:node_modules"
        ]
    )



def setup_ts_specs(name, deps, data_dir = "", suffix = ".json"):
    """ Sets up build configuration to compile ".spec" files
    """

    ts_library(
        name = 'test_library',
        testonly = True,
        srcs = native.glob(
            [
            "**/*.spec.ts",
            ]
        ),
        data = native.glob([
            data_dir + "**/*" + suffix,
        ]),
        tsconfig = "//:tsconfig.json",
        deps = deps + [
            "@npm//:node_modules"
        ]
    )

    jasmine_node_test(
        name = name,
        size = "small",
        srcs = [":test_library"],
        install_source_map_support = True,
        deps = [
            "@npm//source-map-support",
        ]
    )

