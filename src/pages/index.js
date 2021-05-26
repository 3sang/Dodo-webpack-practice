import React from 'react';
import ResizableTable from './resizableTable';
import {Button} from 'antd';
// const LazyPage = ()=>import ('./lazyload-page');

function Index(props) {
  const columns = [
    {
      width: 150,
      title: '序号',
      key: 'id',
      dataIndex: 'id',
    },
    {
      width: 150,
      title: '列标题',
      key: '111',
      dataIndex: '111',
    },
    {
      width: 150,
      title: '列标题',
      key: '222',
      dataIndex: '222',
    },
    {
      width: 150,
      title: '列标题',
      key: '333',
      dataIndex: '333',
    },
    {
      width: 150,
      title: '列标题',
      key: '444',
      dataIndex: '444',
    },
    {
      width: 150,
      title: '列标题',
      key: '555',
      dataIndex: '555',
    },
  ];

  const dataSource = [
    {
      id: '111',
      111: '111',
      222: '111',
      333: '111',
      444: '111',
      555: '111',
    },
    {
      id: '222',
      111: '111',
      222: '111',
      333: '111',
      444: '111',
      555: '111',
    },
    {
      id: '333',
      111: '111',
      222: '111',
      333: '111',
      444: '111',
      555: '111',
    },
  ];

  const tableprops = {
    collapsed:false,
    bordered: true,
    rowKey: 'id',
    columns: columns,
    loading: false,
    dataSource: dataSource,
    pagination: {
      pageSize: 10,
      current: 1,
      // onChange: this.pagination2Change,
      size: 'small',
      total: 3,
      showTotal: (total, range) => `${range[0]}-${range[1]} 共${total}条`,
    },
  };
  return <>
  <Button type='primary'>测试组件颜色是否变化</Button>
  {/* <LazyPage /> */}
  <ResizableTable {...tableprops}/>
  </>;
}

export default Index;
