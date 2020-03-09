import React, { Component } from 'react';
import { connect } from 'dva';
import { Table } from 'antd';


import { formRequest} from '../../utils'

const columns = [
  {
    title: '设备SN',
    dataIndex: 'sn',
  },
  {
    title: '所处车间',
    dataIndex: 'place',
  },
  {
    title: '所处区域',
    dataIndex: 'region',
  },
  {
    title: '当前信号强度',
    dataIndex: 'single',
  },
  {
    title: '当前电量',
    dataIndex: 'battery',
  },
  {
    title: '最后活跃时间',
    dataIndex: 'last_active_time',
  },
  {
    title: '同步状态',
    dataIndex: 'status',
  },
];


class StationList extends Component {


  handleSearch = conditions => {
    this.setState({conditions})
    this.props.loadAdReport(conditions)
  }
  
  render() {
    const dataSources = this.props.result
    console.log(dataSources)

    return (
      <div>
       
        {/* <ReportForm
          onSearch={this.handleSearch}
          onDownload={conditions => formRequest(`${HTTP_API_ROOT}/basestation/station_list`, 'post', conditions)}
          loading={this.props.loading} /> */}
        <Table
          columns={columns}
          dataSource={this.props.result}
          rowKey="id"
          // pagination={{
          //   total: this.props.total,
          //   onChange: this.handlePageChange
          // }}
          loading={this.props.loading}
        />
      </div>
 
    )};
  
}

export default StationList;

