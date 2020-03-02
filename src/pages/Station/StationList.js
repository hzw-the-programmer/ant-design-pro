
// class StationList extends PureComponent {
//   state = {};
//   render() {
//     return (
//       <div>
//         <Form onSubmit={this.handleSearch} layout="inline">
//           <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
//             <Col md={8} sm={24}>
//               <FormItem label="设备sn">
//                 <input id="device_sn" className="input" />
//                 {/* {getFieldDecorator('name')(<Input placeholder="请输入" />)} */}
//               </FormItem>
//             </Col>

//             <Col md={8} sm={24}>
//               <FormItem label="车间">
//                 <input id="place" className="input" />
//                 {/* {getFieldDecorator('name')(<Input placeholder="请输入" />)} */}
//               </FormItem>
//             </Col>

//             <Col md={8} sm={24}>
//               <span className={styles.submitButtons}>
//                 <Button type="primary" htmlType="submit">
//                   查询
//                 </Button>
//                 <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
//                   重置
//                 </Button>
//               </span>
//             </Col>
//           </Row>
//         </Form>
//         <Table
//           //   dataSource={dataSource}
//           columns={columns}
//         />
//       </div>
//     );
//   }
// }


import React, { Component } from 'react';

import { connect } from 'dva';

import { Table } from 'antd';

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


@connect(({ table }) => ({
  table,
}))
class StationList extends Component {
  render() {
    const {
      table: { stationlist },
    } = this.props;
    return <Table dataSource={stationlist} columns={columns} rowKey="id" />;
  }
}

export default StationList;

