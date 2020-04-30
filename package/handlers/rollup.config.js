export default {
  onwarn: function(warning) {
    if ((warning.code = 'THIS_IS_UNDEFINED')) {
      //https://rollupjs.org/guide/en/#error-this-is-undefined to ignore this warning
      return;
    }
  },
};
