var loaderUtils = require('loader-utils');

module.exports = function(source) {
  console.log(source);
  return source;
};
