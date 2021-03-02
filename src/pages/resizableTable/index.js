/**
 * Description: 公用组件，可伸缩列的列表
 * author: dongxy
 * date: 2020/10/01
 * */
import React, { Component } from 'react';
import { Table } from 'antd';
import { Resizable } from 'react-resizable';
import _ from 'lodash';
import styles from './index.less';

const ResizeableTitle = props => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

/**
 * 使用前必须设置table每一列的列宽度,不用设置ellipsis
 * 使用rowSelect必须设置selectedRowKeys，事关点击选取时刷新机制
 * 使用Hook组件若出现参数不刷新的现象，请使用useReducer
 */

class ResizableTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      tableProps: {},
      tableWidth: 0,
      collapsed: props.collapsed,
      dataSource: [],
    };
    this.tableRef = null;
    this.timer = null;
  }

  componentDidMount() {
    window.addEventListener('resize', this.windowResize);
    this.setState({
      tableWidth: this.tableRef.clientWidth,
      tableProps: _.omit(this.props, [
        'dataSource',
        'columns',
        'rowSelection',
        'pagination',
        'onRow',
        'onExpand',
        'onChange',
      ]),
    });
  }

  static getDerivedStateFromProps(newProps, prevState) {
    if (newProps.loading !== prevState.tableProps.loading) {
      return {
        tableProps: {
          ...prevState.tableProps,
          loading: newProps.loading,
        },
      };
    }

    if (_.isEmpty(newProps.dataSource)) {
      return {
        dataSource: newProps.dataSource,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    if (
      (this.state.columns &&
        this.props.columns.length !== 1 &&
        !_.has(this.state.columns[0], 'onHeaderCell')) ||
      (!_.isEmpty(this.props.columns) &&
        JSON.stringify(prevProps.columns) !== JSON.stringify(this.props.columns))
    ) {
      const columns = this.props.columns.map((col, index) =>
        index === this.props.columns.length - 1
          ? { ...col }
          : {
              ...col,
              onHeaderCell: column => ({
                ellipsis: true,
                width: column.width,
                onResize: this.handleResize(index),
              }),
            },
      );
      this.setState({ columns });
    }

    if (
      !_.isEmpty(this.props.dataSource) &&
      JSON.stringify(this.state.dataSource) !== JSON.stringify(this.props.dataSource)
    ) {
      this.setState({ dataSource: this.props.dataSource });
    }

    if (
      !_.isEmpty(this.props.dataSource) &&
      JSON.stringify(this.props.rowSelection) !== JSON.stringify(prevProps.rowSelection)
    ) {
      this.setState({ dataSource: this.props.dataSource });
    }

    if (this.state.collapsed !== this.props.collapsed) {
      this.setState({ collapsed: this.props.collapsed }, () => this.windowResize('collapsed'));
    }
  }

  components = {
    header: {
      cell: ResizeableTitle,
    },
  };

  windowResize = e => {
    if (e === 'collapsed') {
      this.setState({
        tableWidth: this.props.collapsed
          ? this.tableRef.clientWidth + 150
          : this.tableRef.clientWidth - 150,
      });
    } else if (!_.isEmpty(this.tableRef)) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.tableRef && this.setState({ tableWidth: this.tableRef.clientWidth });
      }, 100);
    }
  };

  handleResize = index => (e, { size }) => {
    this.setState(({ columns }) => {
      const nextColumns = columns;
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
        ellipsis: true,
      };
      return { columns: nextColumns };
    });
  };

  render() {
    const { tableWidth, columns, dataSource } = this.state;
    return (
      <div className={styles.myTable} ref={t => (this.tableRef = t)}>
        <Table
          {...this.state.tableProps}
          dataSource={dataSource}
          columns={columns}
          bordered
          // components={this.components}
          scroll={{ x: tableWidth, scrollToFirstRowOnChange: true }}
          style={{ width: tableWidth }}
          rowSelection={this.props.rowSelection}
          pagination={this.props.pagination}
          onRow={this.props.onRow}
          onExpand={this.props.onExpand}
          onChange={this.props.onChange}
        />
      </div>
    );
  }
}

export default ResizableTable;
