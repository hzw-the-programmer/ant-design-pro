import React, { Component } from 'react';
import { connect } from 'dva';
import { Table,Button,Card , Modal,Form,Input,Popconfirm,Dropdown,Menu} from 'antd';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './BeaconList.less';

import { queryBeacons,deleteBeacons } from '@/services/sh';

function getColumns(operations) {
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
          <Popconfirm title="确定删除?" onConfirm={() => operations.delete(record.id)}>
            <a>删除</a>
          </Popconfirm>     
    },
  ];

  return columns
}

class BeaconList extends Component {

  constructor(props){
    super(props)
    this.state = {
      page: 1,
      rows: 10,
      beacons: [],
      loading: false,
      total: 0,
      mac: '',
      name: '',
    }
    this.handleSearch = this.handleSearch.bind(this)
    this.handlePaginationChange = this.handlePaginationChange.bind(this)
    this.handleMacChange = this.handleMacChange.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  handleSearch() {
    const { rows, mac, name } = this.state
    this.setState({
      loading: true,
      page: 1,
    })
    queryBeacons({ page:1 , rows, mac, name }).then(response => {
      // setTimeout(() => {
        this.setState({
          beacons: response.result.rows,
          loading: false,
          total: parseInt(response.result.total, 10),
        })
      // }, 3000)
    })
  }

  handlePaginationChange(page, pageSize) {
    this.setState({
      loading: true,
      page,
      rows: pageSize,
    })
    queryBeacons({ page, pageSize }).then(response => {
      // setTimeout(() => {
        this.setState({
          beacons: response.result.rows,
          loading: false,
          total: parseInt(response.result.total, 10),
        })
      // }, 3000)
    })
  }

  handleMacChange(event) {
    this.setState({
      mac: event.target.value,
    })
  }

  handleNameChange(event) {
    this.setState({
      name: event.target.value,
    })
  }

  handleDelete(id) {
    const { page, rows, mac, name } = this.state

    this.setState({
      loading: true,
    })

    deleteBeacons({ id }).then(response => {   
      queryBeacons({ page , rows, mac, name }).then(response => {
        // setTimeout(() => {
          this.setState({
            beacons: response.result.rows,
            loading: false,
            total: parseInt(response.result.total, 10),
          })
        // }, 3000)
      })
    })
  }

  render() {
    const { page, rows, beacons, loading, total, mac, name } = this.state

    return (
      <PageHeaderWrapper>
        <div className={styles.standardList}>
          <Input addonBefore="MAC" placeholder="请输入" value={mac} onChange={this.handleMacChange}  />
          <Input addonBefore="姓名" placeholder="请输入" value={name} onChange={this.handleNameChange}  />
          <Button onClick={this.handleSearch} loading={loading}>查询</Button>
          <Table 
            dataSource={beacons}
            columns={getColumns({delete: this.handleDelete})}
            rowKey="id"
            loading={loading}
            pagination={{current: page, pageSize: rows, total, onChange: this.handlePaginationChange}}
          />
        </div>
     </PageHeaderWrapper>
    );
  }
}

export default BeaconList;
