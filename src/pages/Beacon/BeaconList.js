import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Card, Button, Table, Modal, Input, Popconfirm, message } from 'antd';

import { formatMessage, FormattedMessage } from 'umi/locale';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './BeaconList.less';

import { queryBeacons, deleteBeacon, createBeacon, debindBeacon, bindBeacon } from '@/services/sh';

function getColumns(operations) {
  const columns = [
    {
      title: formatMessage({ id: 'sh.mac', defaultMessage: 'Mac' }),
      dataIndex: 'mac',
    },
    {
      title: formatMessage({ id: 'sh.name', defaultMessage: 'Name' }),
      dataIndex: 'name',
    },
    {
      title: formatMessage({ id: 'sh.work-number', defaultMessage: 'Number' }),
      dataIndex: 'number',
    },
    {
      title: formatMessage({ id: 'sh.battery', defaultMessage: 'Battery' }),
      dataIndex: 'battery',
    },
    {
      title: formatMessage({ id: 'sh.rssi', defaultMessage: 'Rssi' }),
      dataIndex: 'rssi',
    },
    
    {
      title: formatMessage({ id: 'sh.operation', defaultMessage: 'Operation' }),
      dataIndex: 'operation',
      render: (text, record) =>
          <span>
            <Popconfirm
              title={formatMessage({ id: 'sh.delete-confirm', defaultMessage: 'Delete?' })}
              onConfirm={() => operations.delete(record.id)}
            >
              <a>{formatMessage({ id: 'sh.delete', defaultMessage: 'Delete' })}</a>
            </Popconfirm>
            &nbsp;
            <Popconfirm
              title={formatMessage({ id: 'sh.debind-confirm', defaultMessage: 'Debind?' })}
              onConfirm={() => operations.debind(record.id)}
            >
              <a>{formatMessage({ id: 'sh.debind', defaultMessage: 'Debind' })}</a>
            </Popconfirm>
            &nbsp;
            <Popconfirm
              title={formatMessage({ id: 'sh.bind-confirm', defaultMessage: 'Bind?' })}
              onConfirm={() => operations.bind(record.id)}
            >
              <a>{formatMessage({ id: 'sh.bind', defaultMessage: 'Bind' })}</a>
            </Popconfirm>
          </span> 
    },
  ];

  return columns
}

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd(fieldsValue);
    });
  };

  return (
    <Modal
      destroyOnClose
      title={formatMessage({ id: 'sh.add', defaultMessage: 'Add' })}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <Form.Item
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        label={formatMessage({ id: 'sh.mac', defaultMessage: 'Mac' })}>
        {form.getFieldDecorator('mac', {
          rules: [{
            required: true,
            message: formatMessage({ id: 'sh.four-hex-digits', defaultMessage: 'Please input 4 hex digits'}),
            min: 4,
            max: 4
          }],
        })(<Input placeholder={formatMessage({ id: 'sh.please-input', defaultMessage: 'Please input' })} />)}
      </Form.Item>
    </Modal>
  );
});
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
    modalVisible: false,
  }

  searchBeacons = (pagination, params) => {
    this.setState({
      loading: true,
    })

    queryBeacons(pagination, params).then(response => {
      // setTimeout(() => {
        this.setState({
          loading: false,
          beacons: response.result.rows,
          total: parseInt(response.result.total, 10),
          pagination,
        })
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

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleAdd = fields => {
    const { pagination, params } = this.state

    this.setState({
      loading: true,
    })

    createBeacon(fields).then(response => {
      message.success(formatMessage({ id: 'sh.add-success', defaultMessage: 'Add success!' }));
      this.handleModalVisible();
      this.searchBeacons(pagination, params)
    })
  };

  handleDebind = id => {
    const { pagination, params } = this.state

    this.setState({
      loading: true,
    })

    debindBeacon({ id }).then(response => {   
      this.searchBeacons(pagination, params)
    })
  }

  handleBind = id => {
    const { pagination, params } = this.state

    this.setState({
      loading: true,
    })

    bindBeacon({ id }).then(response => {   
      this.searchBeacons(pagination, params)
    })
  }

  renderForm = loading => {
    const { form: { getFieldDecorator } } = this.props
    
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ lg: 24, xl: 48 }}>
          <Col md={8}>
            <Form.Item label={formatMessage({ id: 'sh.mac', defaultMessage: 'Mac' })}>
              {getFieldDecorator('mac')(<Input placeholder={formatMessage({ id: 'sh.please-input', defaultMessage: 'Please input' })} />)}
            </Form.Item>      
          </Col>
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
        </Row>
        <Row gutter={{ lg: 24, xl: 48 }}>
          <Col md={8}>
            <Form.Item label={formatMessage({ id: 'sh.type', defaultMessage: 'Type' })}>
              {getFieldDecorator('type')(<Input placeholder={formatMessage({ id: 'sh.please-input', defaultMessage: 'Please input' })} />)}
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
    const { loading, pagination: { page, pageSize }, beacons, total, modalVisible } = this.state

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm(loading)}
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                {formatMessage({ id: 'sh.add', defaultMessage: 'Add' })}
              </Button>
            </div>
            <Table 
              dataSource={beacons}
              columns={getColumns({
                delete: this.handleDelete,
                debind: this.handleDebind,
                bind: this.handleBind,
              })}
              rowKey="id"
              loading={loading}
              pagination={{current: page, pageSize, total, onChange: this.handlePaginationChange}}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
     </PageHeaderWrapper>
    );
  }
}

export default BeaconList;
