import React, { Component } from 'react';
import { connect } from 'dva';

import { Form, Row, Col, Card, Button, Table, Input, Popconfirm, message,Cascader } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './StationList.less';

import { queryStations,queryPlaces } from '@/services/sh';

import { formatDate } from '@/utils/sh';


function getColumns(operations) {

  const columns = [
    {
      title: formatMessage({ id: 'sh.stSn', defaultMessage: 'Sn' }),
      dataIndex: 'sn',
    },
    {
      title: formatMessage({id: 'sh.place', defaultMessage: 'Place'}),
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
      render: activeTime => {
        return formatDate(activeTime)
      }
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


function getPlace(places) {
  const res = []
    if (places) {
      places.forEach(d => {
        res.push({
          value: d.id,
          label: d.name,
          children: getPlace(d.children)
      })
    })
  }
  return res
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
    places: [],
  }

  componentDidMount() {

    //查询位置
    queryPlaces().then(response => {
        this.setState({
          places: response.children,
        })
    })

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
          total: parseInt(response.total, 10),
          pagination,
        })

        // console.log(response.result.length)
      // }, 3000)
    })
  }

  onChangePlaces = value => {

    console.log(value[value.length -1]);
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

  renderForm = (loading,places) => {
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
            <Form.Item label={formatMessage({ id: 'sh.place', defaultMessage: 'Place' })}>
              {getFieldDecorator('place_id') (        
              <Cascader
                  options={getPlace(places)}
                  onChange={this.onChangePlaces}                    
                  placeholder={formatMessage({ id: 'sh.please-input-place', defaultMessage: 'Please input place'})}
              />
              )}
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
    const { loading, pagination: { page, pageSize }, stations, total,places,place_id} = this.state

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm(loading,places,place_id)}
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

