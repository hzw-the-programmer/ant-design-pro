import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Table,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Steps,
  Radio,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './StationList.less';

const FormItem = Form.Item;

const columns = [
  {
    title: '设备SN',
    dataIndex: ' sn',
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
    dataIndex: 'last_active_time ',
  },
  {
    title: '同步状态',
    dataIndex: 'status',
  },
];

class StationList extends PureComponent {
  state = {};
  render() {
    return (
      <div>
        <Form onSubmit={this.handleSearch} layout="inline">
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <FormItem label="设备sn">
                <input id="device_sn" className="input" />
                {/* {getFieldDecorator('name')(<Input placeholder="请输入" />)} */}
              </FormItem>
            </Col>

            <Col md={8} sm={24}>
              <FormItem label="车间">
                <input id="place" className="input" />
                {/* {getFieldDecorator('name')(<Input placeholder="请输入" />)} */}
              </FormItem>
            </Col>

            <Col md={8} sm={24}>
              <span className={styles.submitButtons}>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  重置
                </Button>
              </span>
            </Col>
          </Row>
        </Form>

        <Table
          //   dataSource={dataSource}
          columns={columns}
        />
      </div>
    );
  }
}

export default StationList;
