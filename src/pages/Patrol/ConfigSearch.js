import React, { PureComponent } from 'react'

import {
    Form,
    Input,
    Button,
    Row,
    Col,
    Table,
    Card,
    Select,
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

@connect(({ config_search, patrol_log }) => ({
    config_search, patrol_log,
}))
@Form.create()
class ConfigSearch extends PureComponent {
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

    render() {
        const {
            form: {
                getFieldDecorator
            },
            config_search: {
                pagination,
                data,
                loading,
                fields,
            },
            patrol_log: { people },
        } = this.props

        return (
            <PageHeaderWrapper>
                <Card>
                    <div className={styles.form}>
                        <Form layout="inline" onSubmit={this.onSubmit}>
                            <Row gutter={{md: 8}}>
                                <Col md={8}>
                                    <Form.Item label="姓名">
                                        {getFieldDecorator('name', {
                                            initialValue: fields.name,
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
                                                    <Select.Option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col md={8}>
                                    <Button
                                        htmlType="submit"
                                        loading={loading}
                                        style={{marginBottom: '24px'}}
                                    >
                                        查询
                                    </Button>
                                </Col>
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
                </Card>
            </PageHeaderWrapper>
        )
    }
}

export default ConfigSearch
