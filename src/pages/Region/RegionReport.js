import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Card, Input , Button , List } from 'antd'

import { formatMessage, FormattedMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './RegionReport.less';

// import { queryStations } from '@/services/sh';

@Form.create()
class RegionReport extends Component {

    state = {
        loading: false,
        params: {},
        stations: [],
        total: 0,
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
          
            {/* <div style={{ overflow: 'hidden' }}>
              <div style={{ float: 'right', marginBottom: 24 }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {formatMessage({ id: 'sh.search', defaultMessage: 'Search' })}
                </Button>
                <Button style={{ marginLeft: 8 }} loading={loading}  onClick={this.handleFormReset}>
                  {formatMessage({ id: 'sh.reset', defaultMessage: 'Reset' })}
                </Button>
              </div>
            </div> */}
          </Form>
        )
      }


    render() { 

        const { loading} = this.state

        return (
          <PageHeaderWrapper>
            <Card>
              <div className={styles.tableList}>
                <div className={styles.tableListForm}>
                  {this.renderForm(loading)}
                </div>          
              </div>
            </Card>     
         </PageHeaderWrapper>
        );

        

    }
}
export default RegionReport;