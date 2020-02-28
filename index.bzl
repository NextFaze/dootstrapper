load("@npm_bazel_jasmine//:index.bzl", "jasmine_node_test")
load("@npm_bazel_typescript//:index.bzl", "ts_library")

def setup_ts_build(name, srcs = [], deps = []):
    """ Sets up default build configuration to compile ts sources with npm hosted deps        
        @param name - name of the target (required)
        @param deps - list of internal targets that this build relies on
                    - external npm deps is already been taken care of
    """
    if not srcs:
        srcs = native.glob(
            [
                "**/*.ts",
            ],
            exclude = ["**/*.spec.ts"],
        )

    ts_library(
        name = name,
        srcs = srcs,
        tsconfig = "//:tsconfig.json",
        deps = deps + [
            "@npm//:node_modules",
        ],
    )

def setup_ts_specs(name, deps, data_dir = "", suffix = ".json"):
    """ Sets up build configuration to compile ".spec" files
        @param name     - name of the build target (required)
        @param deps     - list of internal targets that this test target relies on (required)
        @param data_dir - name of data directory which needs to be available at runtime
                        - by default no additional data is made available
        @param suffix   - if data_dir is available, optionally provide suffix to only include those files
                        - default .json
    """

    ts_library(
        name = "test_library",
        testonly = True,
        srcs = native.glob(
            [
                "**/*.spec.ts",
            ],
        ),
        data = native.glob([
            data_dir + "**/*" + suffix,
        ]),
        tsconfig = "//:tsconfig.json",
        deps = deps + [
            "@npm//:node_modules",
        ],
    )

    jasmine_node_test(
        name = name,
        size = "small",
        srcs = [":test_library"],
        install_source_map_support = True,
        deps = [
            "@npm//source-map-support",
        ],
    )
