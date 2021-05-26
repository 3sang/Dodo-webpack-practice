/*
 * Description  : 测试懒加载组件
 * Author       : Saraku.
 * Date         : 2021-05-25 23:23:16
 * LastEditors  : Saraku.
 * LastEditTime : 2021-05-26 11:05:49
 */

import React,{lazy,Suspense} from 'react';
import { Button } from 'antd';

// const Lazyimg = lazy(() => import('../assets/yay.jpg'));

export default function LazyPage(props) {
  let btn = false;
  console.log('我希望这个组件懒加载');
  return (
    <div>
      这是一个懒加载组件
      <Button onClick={() => (btn = !btn)}>这是一个懒加载组件按钮。点击再懒加载一张图片</Button>
      {/* {btn && (
        <Suspense fallback={<div>loading...</div>}>
          <img src={Lazyimg} />
        </Suspense>
      )} */}
    </div>
  );
}
