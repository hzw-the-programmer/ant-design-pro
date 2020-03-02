import React, { Component } from 'react';

import { connect } from 'dva';

import { Table } from 'antd';

const columns = [
  {
    title: '信标Sn',
    dataIndex: 'mac',
  },
  {
    title: '姓名',
    dataIndex: 'name',
  },
  {
    title: '工号',
    dataIndex: 'number',
  },
  {
    title: '电量',
    dataIndex: 'battery',
  },
  {
    title: '强度',
    dataIndex: 'rssi',
  },

];


@connect(({ table }) => ({
  table,
}))
class BeaconList extends Component {
  render() {
    const {
      table: { beaconlist },
    } = this.props;
    return <Table dataSource={beaconlist} columns={columns} rowKey="id" />;
  }
}

export default BeaconList;

