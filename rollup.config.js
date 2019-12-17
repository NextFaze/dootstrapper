import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import builtins from "rollup-plugin-node-builtins";
import autoExternal from "rollup-plugin-auto-external";

export default {
  plugins: [
    resolve(), // resolve internal deps
    commonjs(), // handle external cjs modules
    autoExternal(), // do not include external module in bundle
    builtins() // exclude builtin modules i.e(path, fs),
  ],
  onwarn: function(warning) {
    if ((warning.code = "THIS_IS_UNDEFINED")) {
      //https://rollupjs.org/guide/en/#error-this-is-undefined to ignore this warning
      return;
    }
  }
};
