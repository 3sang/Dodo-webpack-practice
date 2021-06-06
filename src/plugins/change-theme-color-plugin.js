class ChangeThemeColorPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const replaceColor = this.options.primaryColor || '#1890ff';
    // emit是异步hook
    compiler.hooks.emit.tapAsync('ChangeThemeColorPlugin', (compilation, callback) => {
      // 只遍历css资源
      const reg = /.css$/;
      const css_assets_keys = Object.keys(compilation.assets).filter(item => reg.test(item));

      // console.log(css_assets_keys)
      // [ 'main.css', 'antdui.css' ]

      // 尝试只打印main.css的内容做例子，修改整体，主题色：#1890ff
      css_assets_keys.forEach(css_key => {
        const css_source = compilation.assets[css_key].source();
        const replace_source = css_source.replace('#1890ff', replaceColor);
        // 重写回去
        compilation.assets[css_key] = {
          source: () => replace_source,
          size: () => replace_source.length,
        };

        // console.log(css_key,replace_source)
      });
      callback();
    });
  }
}

module.exports = ChangeThemeColorPlugin;
