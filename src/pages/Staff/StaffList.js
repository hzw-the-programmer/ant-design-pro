import React, { Component } from 'react';

import { connect } from 'dva';

import { Table } from 'antd';

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
  },
  {
    title: '工号',
    dataIndex: 'number',
  },
  {
    title: '班组',
    dataIndex: 'team',
  },

];


@connect(({ table }) => ({
  table,
}))
class StaffList extends Component {
  render() {
    const {
      table: { stafflist },
    } = this.props;
    return <Table dataSource={stafflist} columns={columns} rowKey="id" />;
  }
}

export default StaffList;
