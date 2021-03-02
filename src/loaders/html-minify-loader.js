// src/loaders/html-minify-loader.js
var loaderUtils = require('loader-utils');
var Minimize = require('minimize');

module.exports = function(source) {
  console.log(source);
  var options = loaderUtils.getOptions(this) || {}; //这里拿到 webpack.config.js 的 loader 配置
  var minimize = new Minimize(options);
  return minimize.parse(source);
};

// 异步
// module.exports = function(source) {
//   var callback = this.async();
//   if (this.cacheable) {
//       this.cacheable();
//   }
//   var opts = loaderUtils.getOptions(this) || {};
//   var minimize = new Minimize(opts);
//   minimize.parse(source, callback);
// };
