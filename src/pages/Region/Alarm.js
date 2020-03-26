import React, { PureComponent } from 'react'

import { Card, Radio, Table, Popconfirm } from 'antd'
import { connect } from 'dva'

import { formatMessage } from 'umi/locale';

import moment from 'moment'

import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import { ALL, UNHANDLED, HANDLED } from './constants'

@connect(({ alarm }) => ({
    alarm,
}))
class Alarm extends PureComponent {
    columns = [
        {
            title: '工号',
            dataIndex: 'number',
        },
        {
            title: '姓名',
            dataIndex: 'name',
        },
        {
            title: '区域',
            dataIndex: 'region_name',
        },
        {
            title: '报警类型',
            dataIndex: 'alarm_type',
            render(value) {
                return value === 1 ? '进入未许可区域' : '离开限制性区域'
            }
        },
        {
            title: '时间',
            dataIndex: 'timestamp',
            render(value, record, index) {
                return moment.unix(value).format('YYYY-MM-DD HH:mm:ss')
            }
        },
        {
            title: '操作',
            render: (value, record, index) => {
                if (value.handled === HANDLED) {
                    return
                }
                
                return (
                    <Popconfirm
                        title="确定处理吗？"
                        onConfirm={() => this.handleProcess(value.id)}
                    >
                        <a>处理</a>
                    </Popconfirm>
                )
            }
        }
    ]

    handleFilterChange = ev => {
        const {
            alarm: { pagination: { pageSize } },
            dispatch,
        } = this.props
        const { target: { value } } = ev

        dispatch({
            type: 'alarm/fetchAlarms',
            payload: { filter: value, current: 1, pageSize },
        })
    }

    handlePageChange = (current, pageSize) => {
        const {
            alarm: { filter },
            dispatch,
        } = this.props
        
        dispatch({
            type: 'alarm/fetchAlarms',
            payload: { filter, current, pageSize },
        })
    }

    handleProcess = id => {
        const { dispatch } = this.props
        
        dispatch({
            type: 'alarm/processAndFetchAlarms',
            payload: { id, handle: 2 },
        })
    }

    componentDidMount() {
        const {
            alarm: { filter, pagination: { current, pageSize } },
            dispatch,
        } = this.props
        
        dispatch({
            type: 'alarm/fetchAlarms',
            payload: { filter, current, pageSize },
        })
    }

    render() {
        const {
            alarm: {
                filter,
                pagination,
                dataSource,
                loading
            }
        } = this.props
        
        const extraContent = (
            <Radio.Group value={filter} onChange={this.handleFilterChange}>
                <Radio.Button value={ALL}>全部</Radio.Button>
                <Radio.Button value={UNHANDLED}>未处理</Radio.Button>
                <Radio.Button value={HANDLED}>已处理</Radio.Button>
            </Radio.Group>
        );
        return (
            <PageHeaderWrapper>
                <Card
                    title={formatMessage({ id: 'menu.alarm', defaultMessage: 'Region Alarm' })}
                    extra={extraContent}
                >
                    <Table
                        columns={this.columns}
                        dataSource={dataSource}
                        pagination={{...pagination, onChange: this.handlePageChange}}
                        rowKey="id"
                        loading={loading}
                    />
                </Card>
            </PageHeaderWrapper>
        )
    }
}

export default Alarm
