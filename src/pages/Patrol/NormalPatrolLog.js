import React, { PureComponent } from 'react'

import {
    Card,
    Form,
    Select,
    DatePicker,
    Row,
    Col,
    Button,
    Table,
} from 'antd'

import { connect } from 'dva'

import PageHeaderWrapper from '@/components/PageHeaderWrapper'

import styles from './styles.less'

const columns = [
    {
        title: '日期',
        dataIndex: 'patrol_date',
    },
    {
        title: '巡更点',
        dataIndex: 'ps_name',
    },
    {
        title: '姓名',
        dataIndex: 'staff_name',
    },
    {
        title: '开始时间',
        dataIndex: 'starttime',
    },
    {
        title: '结束时间',
        dataIndex: 'endtime',
    },
]

@connect(({ patrol_log, normal_patrol_log }) => ({
    patrol_log,
    normal_patrol_log,
}))
@Form.create()
class NormalPatrolLog extends PureComponent {
    handleSubmit = e => {
        const {
            form,
            dispatch,
            normal_patrol_log: { pagination },
        } = this.props
        
        e.preventDefault()

        form.validateFields((errors, formValues) => {
            if (errors) return

            dispatch({
                type: 'normal_patrol_log/queryNormalPatrolLog',
                payload: {...formValues, current: 1, pageSize: pagination.pageSize},
            })
        })
    }

    handlePageChange = (current, pageSize) => {
        const { dispatch, normal_patrol_log: { formValues } } = this.props
        dispatch({
            type: 'normal_patrol_log/queryNormalPatrolLog',
            payload: {...formValues, current, pageSize},
        })
    }

    render() {
        const {
            form: { getFieldDecorator },
            patrol_log: { people },
            normal_patrol_log: { formValues, logs, loading, pagination },
        } = this.props

        return (
            <PageHeaderWrapper>
                <Card>
                    <div className={styles.form}>
                        <Form layout="inline" onSubmit={this.handleSubmit}>
                            <Row gutter={{md: 8}}>
                                <Col md={8}>
                                    <Form.Item label="姓名">
                                        {getFieldDecorator('name', {
                                            initialValue: formValues.name,
                                        })(
                                            <Select
                                                allowClear
                                                showSearch={true}
                                                filterOption={(input, option) => {
                                                    const re = new RegExp(`.*${input}.*`)
                                                    return re.exec(option.props.children) !== null
                                                }}    
                                            >
                                                {people.map(p => (
                                                    <Select.Option value={p.id} key={p.id}>
                                                        {p.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col md={8}>
                                    <Form.Item label="时间">
                                        {getFieldDecorator('datetime', {
                                            initialValue: formValues.datetime,
                                        })(
                                            <DatePicker.RangePicker
                                                style={{width: '100%'}}
                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col md={8}>
                                    <Button htmlType="submit" loading={loading}>查询</Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={logs}
                        loading={loading}
                        rowKey="id"
                        pagination={{...pagination, onChange: this.handlePageChange}}
                    />
                </Card>
            </PageHeaderWrapper>
        )
    }
}

export default NormalPatrolLog
                    