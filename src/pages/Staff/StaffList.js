import React, { Component } from 'react';
import { connect } from 'dva';

import { Form, Row, Col, Card, Button, Table, Input, Popconfirm, message } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './StaffList.less';

import { queryStaffs } from '@/services/sh';

function getColumns(operations) {

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

    return columns
}
@Form.create()

class StaffList extends Component {
  state = {
    loading: false,
    pagination: {
      page: 1,
      pageSize: 10,
    },
    params: {},
    staffs: [],
    total: 0,
  }

  searchStaffs = (pagination, params) => {
    this.setState({
      loading: true,
    })

    queryStaffs(pagination, params).then(response => {
      // setTimeout(() => {
        this.setState({
          loading: false,
          staffs: response.result.rows,
          total: parseInt(response.result.total, 10),
          pagination,
        })

        // console.log(response.result.length)
      // }, 3000)
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
      this.searchStaffs(pagination, params)
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
    this.searchStaffs(pagination, {})
  };

  handlePaginationChange = (page, pageSize) => {
    const { params } = this.state
    const pagination = { page, pageSize }
    this.searchStaffs(pagination, params)
  }

  renderForm = loading => {
    const { form: { getFieldDecorator } } = this.props
    
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ lg: 24, xl: 48 }}>
          <Col md={8}>
            <Form.Item label={formatMessage({ id: 'sh.name', defaultMessage: 'Name' })}>
              {getFieldDecorator('name')(<Input placeholder={formatMessage({ id: 'sh.please-input', defaultMessage: 'Please input' })} />)}
            </Form.Item>      
          </Col>
          <Col md={8}>
            <Form.Item label={formatMessage({ id: 'sh.work-number', defaultMessage: 'Number' })}>
              {getFieldDecorator('number')(<Input placeholder={formatMessage({ id: 'sh.please-input', defaultMessage: 'Please input' })} />)}
            </Form.Item>
          </Col>
          <Col md={8}>
            <Form.Item label={formatMessage({ id: 'sh.team', defaultMessage: 'Team' })}>
              {getFieldDecorator('team')(<Input placeholder={formatMessage({ id: 'sh.please-input', defaultMessage: 'Please input' })} />)}
            </Form.Item>
          </Col>     
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage({ id: 'sh.search', defaultMessage: 'Search' })}
            </Button>
            <Button style={{ marginLeft: 8 }} loading={loading}  onClick={this.handleFormReset}>
              {formatMessage({ id: 'sh.reset', defaultMessage: 'Reset' })}
            </Button>
          </div>
        </div>
      </Form>
    )
  }
  render() {
    const { loading, pagination: { page, pageSize }, staffs, total} = this.state

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm(loading)}
            </div>

            <Table 
              dataSource={staffs}
              columns={getColumns()}
              rowKey="id"
              loading={loading}
              pagination={{current: page, pageSize, total, onChange: this.handlePaginationChange}}
            />
          </div>
        </Card>     
     </PageHeaderWrapper>
    );
  }
}

export default StaffList;
