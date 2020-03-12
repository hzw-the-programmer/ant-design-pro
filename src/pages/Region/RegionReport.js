import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Card, Input, Button, DatePicker } from 'antd';

import { formatMessage, FormattedMessage } from 'umi/locale';

import ReactEcharts from 'echarts-for-react';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './RegionReport.less';

import { queryEvents } from '@/services/sh';

function getOption(data) {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },

    color: ['#FF0000', '#00FF00'],

    legend: {
      data: ['非工作区', '工作区'],
    },

    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },

    xAxis: {
      type: 'value',
    },

    yAxis: {
      type: 'category',
      data: [],
    },

    series: [
      {
        name: '非工作区',
        type: 'bar',
        stack: '总量',
        label: {
          show: true,
          position: 'insideRight',
        },
        data: [],
      },
      {
        name: '工作区',
        type: 'bar',
        stack: '总量',
        label: {
          show: true,
          position: 'insideRight',
        },
        data: [],
      },
    ],
  };

  data.forEach(d => {
    option.yAxis.data.push(d.name);
    option.series[0].data.push(d.data[0].total);
    option.series[1].data.push(d.data[1].total);
  });

  return option;
}

@Form.create()
class RegionReport extends Component {
  state = {
    loading: false,
    params: {},
    option: {},
  };

  searchEvents = params => {
    this.setState({
      loading: true,
    });

    queryEvents(params).then(response => {
      console.log(response);
      this.setState({
        loading: false,
        option: getOption(response.result),
      });
    });
  };

  handleFormReset = () => {
    const { form } = this.props;

    form.resetFields();
    this.setState({
      params: {},
    });
    console.log('取消');
  };

  handleSearch = e => {
    e.preventDefault();

    const { form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const params = fieldsValue;

      this.setState({
        params,
      });

      this.searchEvents(params);
    });
  };

  renderForm = loading => {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ lg: 24, xl: 48 }}>
          <Col md={8}>
            <Form.Item label={formatMessage({ id: 'sh.name', defaultMessage: 'Name' })}>
              {getFieldDecorator('name')(
                <Input
                  placeholder={formatMessage({
                    id: 'sh.please-input',
                    defaultMessage: 'Please input',
                  })}
                />
              )}
            </Form.Item>
          </Col>
          <Col md={8}>
            <Form.Item label={formatMessage({ id: 'sh.work-number', defaultMessage: 'Number' })}>
              {getFieldDecorator('number')(
                <Input
                  placeholder={formatMessage({
                    id: 'sh.please-input',
                    defaultMessage: 'Please input',
                  })}
                />
              )}
            </Form.Item>
          </Col>
          <Col md={8}>
            <Form.Item label={formatMessage({ id: 'sh.team', defaultMessage: 'Team' })}>
              {getFieldDecorator('team')(
                <Input
                  placeholder={formatMessage({
                    id: 'sh.please-input',
                    defaultMessage: 'Please input',
                  })}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={{ lg: 24, xl: 48 }}>
          <Col md={8}>
            <Form.Item label={formatMessage({ id: 'sh.date', defaultMessage: 'Date' })}>
              {getFieldDecorator('datetime')(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder={formatMessage({
                    id: 'sh.please-input-date',
                    defaultMessage: 'Please input date',
                  })}
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
            <Button style={{ marginLeft: 8 }} loading={loading} onClick={this.handleFormReset}>
              {formatMessage({ id: 'sh.reset', defaultMessage: 'Reset' })}
            </Button>
          </div>
        </div>
      </Form>
    );
  };

  render() {
    const { loading, option } = this.state;
    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm(loading)}</div>
            <ReactEcharts option={option} />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default RegionReport;
