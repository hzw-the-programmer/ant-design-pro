import React, { PureComponent } from 'react'

import {
    Form,
    Input,
    Button,
    Row,
    Col,
    Table
} from 'antd'

import { connect } from 'dva'

import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './ConfigSearch.less'

const columns = [
    {
        title: '姓名',
        dataIndex: 'staff_name',
    },
    {
        title: 'mac',
        dataIndex: 'ibeacon_mac',
    },
    {
        title: '巡更周期',
        dataIndex: 'patrol_cycle',
    },
    {
        title: '开始时间',
        dataIndex: 'starttime',
    },
    {
        title: '结束时间',
        dataIndex: 'endtime',
    },
    {
        title: '巡更点',
        dataIndex: 'ps_name',
        render(value) {
            return value.join(', ')
        }
    },
]

@connect(({ config_search }) => ({
    config_search,
}))
@Form.create()
class ConfigSearch extends PureComponent {
    componentDidMount() {
        const { form, config_search: { fields } } = this.props
        form.setFieldsValue(fields)
    }

    onSubmit = ev => {
        ev.preventDefault()
        const {
            form,
            config_search: {
                pagination: {
                    pageSize
                }
            },
            dispatch,
        } = this.props
        
        form.validateFields((errors, fields) => {
            if (errors) return
            dispatch({
                type: 'config_search/queryPatrolConfigs',
                payload: {...fields, current: 1, pageSize}
            })
        })
    }

    onPaginationChange = (current, pageSize) => {
        const {
            dispatch,
            config_search: {
                fields,
            }
        } = this.props
        
        dispatch({
            type: 'config_search/queryPatrolConfigs',
            payload: {fields, current, pageSize}
        })
    }

    handleReset = () => {
        const {
            form,
            dispatch,
            config_search: {
                pagination: { pageSize }
            }
        } = this.props
        
        dispatch({
            type: 'config_search/queryPatrolConfigs',
            payload: {current: 1, pageSize}
        })
    }

    render() {
        const {
            form: {
                getFieldDecorator
            },
            config_search: {
                pagination,
                data,
                loading,
            }
        } = this.props
        
        return (
            <PageHeaderWrapper>
                <div className={styles.form}>
                    <Form layout="inline" onSubmit={this.onSubmit}>
                        <Row>
                            <Col md={8}>
                                <Form.Item label="姓名">
                                    {getFieldDecorator('name')(
                                        <Input />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={8}>
                                <Button htmlType="submit" loading={loading}>查询</Button>
                            </Col>
                            {/* <Col md={8}>
                                <Button onClick={this.handleReset} loading={loading}>重置</Button>
                            </Col> */}
                        </Row>
                    </Form>
                </div>
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={{...pagination, onChange: this.onPaginationChange}}
                    rowKey="id"
                    loading={loading}
                />
            </PageHeaderWrapper>
        )
    }
}

export default ConfigSearch
