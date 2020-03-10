import React, { Component } from 'react';
import { connect } from 'dva';

import { Form, Row, Col, Card, Button, Table, Input, Popconfirm, message } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './StationList.less';

import { queryStations } from '@/services/sh';

function getColumns(operations) {

  const columns = [
    {
      title: formatMessage({ id: 'sh.stSn', defaultMessage: 'Sn' }),
      dataIndex: 'sn',
    },
    {
      title: formatMessage({id: 'sh.placeId', defaultMessage: 'PlaceId'}),
      dataIndex: 'placeId',
    },
    {
      title: formatMessage({id: 'sh.region', defaultMessage: 'Region'}),
      dataIndex: 'rName',
    },
    {
      title: formatMessage({id: 'sh.single', defaultMessage: 'Single'}),
      dataIndex: 'rssi',
    },
    {
      title: formatMessage({id: 'sh.battery', defaultMessage: 'Battery'}),
      dataIndex: 'battery',
    },
    {
      title:  formatMessage({id: 'sh.last_active_time', defaultMessage: 'Last active time'}),
      dataIndex: 'activeTime',
      // render: activeTime => {
        
      // }
    },
    {
      title: formatMessage({id: 'sh.sync_status', defaultMessage: 'Sync status'}),
      dataIndex: 'sync',
      render: sync => {
        if (sync === '1') {
          return formatMessage({id: 'sh.sync_yes', defaultMessage: 'Synchronized'})
        }else {
          return formatMessage({id: 'sh.sync_no', defaultMessage: 'Unsynchronized'})
        }
      }
    },
  ];
  return columns
}

@Form.create()
class StationList extends Component {

  state = {
    loading: false,
    pagination: {
      page: 1,
      pageSize: 10,
    },
    params: {},
    stations: [],
    total: 0,
  }

  searchStations = (pagination, params) => {
    this.setState({
      loading: true,
    })

    queryStations(pagination, params).then(response => {
      // setTimeout(() => {
        this.setState({
          loading: false,
          stations: response.result,
          total: parseInt(response.result.length, 10),
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
      this.searchStations(pagination, params)
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
    this.searchStations(pagination, {})
  };

  handlePaginationChange = (page, pageSize) => {
    const { params } = this.state
    const pagination = { page, pageSize }
    this.searchStations(pagination, params)
  }

  renderForm = loading => {
    const { form: { getFieldDecorator } } = this.props
    
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ lg: 24, xl: 48 }}>
          <Col md={8}>
            <Form.Item label={formatMessage({ id: 'sh.Station-sn', defaultMessage: 'Sn' })}>
              {getFieldDecorator('sn')(<Input placeholder={formatMessage({ id: 'sh.please-input', defaultMessage: 'Please input' })} />)}
            </Form.Item>      
          </Col>
          <Col md={8}>
            <Form.Item label={formatMessage({ id: 'sh.placeId', defaultMessage: 'PlaceId' })}>
              {getFieldDecorator('place_id')(<Input placeholder={formatMessage({ id: 'sh.please-input', defaultMessage: 'Please input' })} />)}
            </Form.Item>
          </Col>
          {/* <Col md={8}>
            <Form.Item label={formatMessage({ id: 'sh.work-number', defaultMessage: 'Number' })}>
              {getFieldDecorator('number')(<Input placeholder={formatMessage({ id: 'sh.please-input', defaultMessage: 'Please input' })} />)}
            </Form.Item>
          </Col> */}
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
    const { loading, pagination: { page, pageSize }, stations, total} = this.state

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm(loading)}
            </div>

            <Table 
              dataSource={stations}
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

export default StationList;

