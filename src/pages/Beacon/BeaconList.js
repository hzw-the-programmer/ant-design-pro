import React, { Component } from 'react';
import { connect } from 'dva';
import { Table,Button,Card , Modal,Form,Input,Popconfirm,Dropdown,Menu} from 'antd';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './BeaconList.less';

import { queryBeacons } from '@/services/api';

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
  
  {
    title: '操作',
    dataIndex: 'operation',
    render: (text, record) =>     
        <Popconfirm title="确定删除?" onConfirm={() => this.handleDelete(record.key)}>
          <a>删除</a>
        </Popconfirm>     
  },
];

class BeaconList extends Component {

  constructor(props){
    super(props)
    this.state = {
      page: 1,
      rows: 10,
      beacons: [],
      loading: false,
    }
    this.handleSearch = this.handleSearch.bind(this)
  }

  handleSearch() {
    const { page, rows } = this.state
    this.setState({
      loading: true,
    })
    queryBeacons({ page, rows }).then(response => {
      // setTimeout(() => {
        this.setState({
          beacons: response.result.rows,
          loading: false,
        })
      // }, 3000)
    })
  }

  render() {
    const { page, rows, beacons, loading } = this.state

    return (
      <PageHeaderWrapper>
        <div className={styles.standardList}>
          <Button onClick={this.handleSearch} loading={loading}>查询</Button>
          <Table 
            dataSource={beacons}
            columns={columns}
            rowKey="id"
            loading={loading}
          />
        </div>
     </PageHeaderWrapper>
    );
  }
}

export default BeaconList;
