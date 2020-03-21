import React, { PureComponent } from 'react'

import {
    Form,
    Select,
    DatePicker,
    Row,
    Col,
    Button,
    Card,
    Cascader,
} from 'antd'

import { connect } from 'dva'

import PageHeaderWrapper from '@/components/PageHeaderWrapper'

import styles from './Map.less'

@connect(({ map }) => ({
    map,
}))
@Form.create()
class Map extends PureComponent {
    handleSubmit = e => {
        const { form, dispatch } = this.props
        e.preventDefault()
        form.validateFields((errors, formFields) => {
            if (errors) return
            dispatch({
                type: 'map/saveFormFields',
                payload: formFields,
            })
            dispatch({
                type: 'map/queryPatrolTimeRanges',
                payload: formFields,
            })
        })
    }

    handleTimeRangeChange = timeRange => {
        const { dispatch } = this.props
        dispatch({
            type: 'map/changeTimeRange',
            payload: timeRange,
        })
    }

    render() {
        const {
            form: { getFieldDecorator },
            map: { people, formFields, timeRanges, timeRange, pls },
        } = this.props
        
        return (
            <PageHeaderWrapper>
                <Card>
                    <div className={styles.form}>
                        <Form layout="inline" onSubmit={this.handleSubmit} hideRequiredMark>
                            <Row gutter={{md: 8}}>
                                <Col md={8}>
                                    <Form.Item label="姓名">
                                        {getFieldDecorator('name', {
                                            rules: [{required: true}],
                                            initialValue: formFields.name,
                                        })(
                                            <Select>
                                                {people.map(p => (
                                                    <Select.Option value={p.name} key={p.id}>
                                                        {p.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col md={8}>
                                    <Form.Item label="日期">
                                        {getFieldDecorator('date', {
                                            rules: [{required: true}],
                                            initialValue: formFields.date,
                                        })(
                                            <DatePicker style={{ width: '100%' }} />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col md={8}>
                                    <Button htmlType="submit" type="primary">查询</Button>
                                </Col>
                            </Row>
                        </Form>
                        <Form>
                            <Row gutter={{md: 8}}>
                                <Col md={8}>
                                    <Form.Item label="时间">
                                        <Select value={timeRange} onChange={this.handleTimeRangeChange}>
                                            {timeRanges.map(tr => (
                                                <Select.Option key={tr.id} value={tr.id}>
                                                    {tr.timeRange}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col md={8}>
                                    <Form.Item label="楼层">
                                        <Cascader
                                            options={pls}
                                            allowClear={false}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </Card>
            </PageHeaderWrapper>
        )
    }
}

export default Map
