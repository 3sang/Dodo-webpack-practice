import React, { Component } from 'react';
import { Button } from 'antd';
import styles from './css/index.less';

class Index extends Component {
  render() {
    console.log(styles);
    return (
      <>
        <Button type="primary">测试antd主题色变化</Button>
        <div className={styles.box}>测试自己的颜色变化</div>
      </>
    );
  }
}

export default Index;
