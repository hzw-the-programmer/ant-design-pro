import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Card, Button, Table, Modal,Input,Popconfirm,Dropdown,Menu} from 'antd';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './BeaconList.less';

import { queryBeacons, deleteBeacon } from '@/services/sh';

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
@Form.create()
class BeaconList extends Component {
  state = {
    loading: false,
    pagination: {
      page: 1,
      pageSize: 10,
    },
    params: {},
    beacons: [],
    total: 0,
  }

  searchBeacons = (pagination, params) => {
    this.setState({
      loading: true,
    })

    queryBeacons(pagination, params).then(response => {
      setTimeout(() => {
        this.setState({
          loading: false,
          beacons: response.result.rows,
          total: parseInt(response.result.total, 10),
          pagination,
        })
      }, 3000)
    })
  }

  handleSearch = e => {
    e.preventDefault();

    const { form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const params = fieldsValue

      this.setState({
        params,
      })

      const pagination = { ...this.state.pagination }
      pagination.page = 1
      this.searchBeacons(pagination, params)
    });
  }

  handleFormReset = () => {
    const { form } = this.props;
    
    form.resetFields();
    this.setState({
      params: {},
    })

    const pagination = { ...this.state.pagination }
    pagination.page = 1
    this.searchBeacons(pagination, {})
  };

  handlePaginationChange = (page, pageSize) => {
    const { params } = this.state
    const pagination = { page, pageSize }
    this.searchBeacons(pagination, params)
  }

  handleDelete = id => {
    const { pagination, params } = this.state

    this.setState({
      loading: true,
    })

    deleteBeacon({ id }).then(response => {   
      this.searchBeacons(pagination, params)
    })
  }

  renderForm = loading => {
    const { form: { getFieldDecorator } } = this.props
    
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ lg: 24, xl: 48 }}>
          <Col md={8}>
            <Form.Item label="Mac">
              {getFieldDecorator('mac')(<Input placeholder="请输入" />)}
            </Form.Item>      
          </Col>
          <Col md={8}>
            <Form.Item label="Name">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </Form.Item>
          </Col>
          <Col md={8}>
            <Form.Item label="Number">
              {getFieldDecorator('number')(<Input placeholder="请输入" />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={{ lg: 24, xl: 48 }}>
          <Col md={8}>
            <Form.Item label="Type">
              {getFieldDecorator('type')(<Input placeholder="请输入" />)}
            </Form.Item>      
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} loading={loading}  onClick={this.handleFormReset}>
              重置
            </Button>
          </div>
        </div>
      </Form>
    )
  }

  render() {
    const { loading, pagination: { page, pageSize }, beacons, total } = this.state

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.tableListForm}>
            {this.renderForm(loading)}
          </div>
          <Table 
            dataSource={beacons}
            columns={getColumns({delete: this.handleDelete})}
            rowKey="id"
            loading={loading}
            pagination={{current: page, pageSize, total, onChange: this.handlePaginationChange}}
          />
        </Card>
     </PageHeaderWrapper>
    );
  }
}

export default BeaconList;
