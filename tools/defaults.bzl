load("@npm_bazel_jasmine//:index.bzl", "jasmine_node_test")
load("@npm_bazel_rollup//:index.bzl", "rollup_bundle")
load("@npm_bazel_typescript//:index.bzl", "ts_library")
load("@rules_pkg//:pkg.bzl", "pkg_tar")

def setup_ts_build(name, deps = []):
    """ Sets up default build configuration to compile ts sources with npm hosted deps        
        @param name - name of the target (required)
        @param deps - list of internal targets that this build relies on
                    - external npm deps is already been taken care of
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

def gen_bundle(name, dir_name, deps, srcs = []):
    """Generate tar containing bundled js.
        index.ts must exist next to BUILD file
        rollup.config.js must exist next to WORKSPACE
        This will create "bundle" js under specified dir_name
    """
    rollup_bundle(
        name = "bundle",
        srcs = [
            "//:package.json",
        ],
        config_file = "//:rollup.config.js",
        entry_point = ":index.ts",
        format = "cjs",
        deps = deps,
    )

    pkg_tar(
        name = name,
        srcs = srcs + [
            ":bundle",
        ],
        extension = "tar.gz",
        package_dir = "",
    )

def gen_artifacts(name, srcs, configs, deps):
    """Generate Artifacts for multiple environments.
    """

    app_srcs = []
    cmd = ""

    for env in configs:
        config = configs[env]
        native.genrule(
            name = "config_%s" % (env),
            srcs = [
                config,
            ],
            outs = [
                env + "/config.json",
            ],
            cmd = "cp $< $@",
        )

        pkg_tar(
            name = "app_" + env,
            srcs = srcs + [":config_%s" % (env)],
            extension = "tar.gz",
            package_dir = env,
            deps = deps,
        )

        cmd += "tar -xzf $(location :app_%s) && " % (env)
        app_srcs.append(":app_%s" % (env))

    cmd += "zip -rq $@ * -x \"*bazel-out*\" -x \"*external*\""

    native.genrule(
        name = "zip",
        srcs = app_srcs,
        outs = [
            name + ".zip",
        ],
        cmd = cmd,
    )
