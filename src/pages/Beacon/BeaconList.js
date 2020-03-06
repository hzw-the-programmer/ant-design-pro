import React, { Component } from 'react';
import { connect } from 'dva';
import { Table,Button,Card , Modal,Form,Input,Popconfirm,Dropdown,Menu} from 'antd';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './BeaconList.less';


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


@connect(({ beacon }) => ({
  beacon,
}))
class BeaconList extends Component {

  constructor(props){
    super(props) 
  }

  render() {
    const {
      beacon: { beacons },
    } = this.props;

    return (
      <PageHeaderWrapper>
        <div className={styles.standardList}>
          <Table 
            dataSource={beacons}
            columns={columns}
            rowKey="id"
          />
        </div>
     </PageHeaderWrapper>
    );
  }
}

export default BeaconList;
