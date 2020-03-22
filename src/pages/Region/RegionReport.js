import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Card, Input, Button, DatePicker, Modal, Table } from 'antd';

import { formatMessage, FormattedMessage } from 'umi/locale';

import moment from 'moment';

import ReactEcharts from 'echarts-for-react';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './RegionReport.less';

import { queryEvents, queryRegionDuration } from '@/services/sh';

function getOption(data) {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },

    color: ['#C21D18', '#23BA23'],

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
      name: 'Hours'
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
    option.series[0].data.push(d.data[1].total );
    option.series[1].data.push(d.data[0].total );
  });

  return option;
}

function getDetailOption(d) {
  const option = {
    title: {
      text: '活动区域时长统计',
      // subtext: '纯属虚构',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: [],
    },
    series: [
      {
        name: '活动时长',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  d.data.forEach(r => {
    r.details.forEach(de => {
      option.legend.data.push(de.region);
      option.series[0].data.push({ value: de.num, name: de.region });
    });
  });

  return option;
}

function getDetailDataSource(d) {
  const ds = []

  d.data.forEach(di => {
    di.details.forEach(dd => {
      ds.push({
        type: di.type,
        name: dd.region,
        duration: dd.min_num + 'min',
        key: dd.region_id,
        id: d.staff_id,
      })
    })
  })

  return ds
}

function disabledDate(current) {
  // 不能选择今天及今天之后的时间
  return current && current > moment().endOf('day');
}

const logColumns = [
  {
    title: '开始时间',
    dataIndex: 'st',
  },
  {
    title: '结束时间',
    dataIndex: 'et',
  },
  {
    title: '时长',
    dataIndex: 'duration',
  },
]

@Form.create()
class RegionReport extends Component {
  state = {
    loading: false,
    params: {},
    data: [],
    detailModalVisible: false,
    detailIndex: 0,
    logModalVisible: false,
    logs: [],
  };

  detailColumns = [
    {
      title: '区域类型',
      dataIndex: 'type',
      render(value) {
          return value === 1 ? '工作区' : '非工作区'
      }
    },
    {
      title: '区域名称',
      dataIndex: 'name',
      render: (text, record) => {
        return <a onClick={() => this.handleRegionClick(record)}>{text}</a>
      }
    },
    {
      title: '区域总时长',
      dataIndex: 'duration',
    },
  ]

  searchEvents = params => {

    this.setState({
      loading: true,
    });

    queryEvents(params).then(response => {
         
      console.log(response);
      this.setState({
        loading: false,
        data: response.result,
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
              {getFieldDecorator('datetime', {
                rules: [{ required: true, message: '请输入日期！' }],
                })(
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
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

  onChartClick = (event, echart) => {
    console.log('onChartClick', event, echart);
    this.setState({
      detailModalVisible: !this.state.detailModalVisible,
      detailIndex: event.dataIndex,
    });
  };

  onChartLegendSelectChanged = (event, echart) => {
    console.log('onChartLegendSelectChanged', event, echart);
  };

  handleDetailModalOk = () => {
    this.setState({
      detailModalVisible: !this.state.detailModalVisible,
    });
  };

  handleRegionClick(record) {
    this.setState({
      logModalVisible: !this.state.logModalVisible,
    });

    const { form } = this.props
    const datetime = form.getFieldValue('datetime')
    datetime.hour(0)
    datetime.minute(0)
    datetime.second(0)
    record.starttime = datetime.unix()
    record.endtime = datetime.unix() + 24 * 60 * 60

    queryRegionDuration(record).then(response => {
      console.log('queryRegionDuration', response)
      const logs = []
      response.result[0].data[0].details.forEach((d, i) =>{
        logs.push({
          st: d.starttime,
          et: d.endtime,
          duration: d.min_num + 'min',
          key: i,
        })
      })
      this.setState({
        logs,
      })
    })
  }

  handleLogModalOk = () => {
    this.setState({
      logModalVisible: !this.state.logModalVisible,
    });
  };

  render() {
    const {
      loading,
      data,
      detailModalVisible,
      detailIndex,
      logModalVisible,
      logs,
    } = this.state;
    
    const onEvents = {
      click: this.onChartClick,
      legendselectchanged: this.onChartLegendSelectChanged,
    };

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm(loading)}</div>
            <ReactEcharts option={getOption(data)} onEvents={onEvents} />
          </div>
        </Card>

        <Modal
          visible={detailModalVisible}
          onOk={this.handleDetailModalOk}
          onCancel={this.handleDetailModalOk}
        >
          {detailIndex < data.length
            ? `${data[detailIndex].name} | ${data[detailIndex].number} | ${data[detailIndex].team}`
            : ''}
          <ReactEcharts
            option={detailIndex < data.length ? getDetailOption(data[detailIndex]) : {}}
          />
          <Table
            columns={this.detailColumns}
            dataSource={detailIndex < data.length ?
              getDetailDataSource(data[detailIndex]) : []} />
        </Modal>

        <Modal
          visible={logModalVisible}
          onOk={this.handleLogModalOk}
          onCancel={this.handleLogModalOk}
        >
          <Table
            columns={logColumns}
            dataSource={logs} />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}
export default RegionReport;
