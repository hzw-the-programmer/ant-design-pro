import React, { Component } from 'react';

import { connect } from 'dva';

import { Table } from 'antd';

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
  },
];

@connect(({ table }) => ({
  table,
}))
class Table1 extends Component {
  render() {
    const {
      table: { people },
    } = this.props;
    return <Table dataSource={people} columns={columns} rowKey="id" />;
  }
}

export default Table1;
