import React, { PureComponent } from 'react'

import { Card, Radio, Table } from 'antd'
import { connect } from 'dva'

import { formatMessage } from 'umi/locale';

import moment from 'moment'

import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import { ALL, UNHANDLED, HANDLED } from './constants'

const columns = [
    {
        title: '工号',
        dataIndex: 'staff_id',
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
    },
    {
        title: '时间',
        dataIndex: 'timestamp',
        render(value, record, index) {
            return moment.unix(value).format('YYYY-MM-DD HH:mm:ss')
        }
    },
]

@connect(({ alarm }) => ({
    alarm,
}))
class Alarm extends PureComponent {
    handleFilterChange = ev => {
        const {
            alarm: { pagination: { current, pageSize } },
            dispatch,
        } = this.props
        const { target: { value } } = ev

        dispatch({
            type: 'alarm/fetchAlarm',
            payload: { filter: value, current, pageSize },
        })
    }

    handlePageChange = (current, pageSize) => {
        const {
            alarm: { filter },
            dispatch,
        } = this.props
        
        dispatch({
            type: 'alarm/fetchAlarm',
            payload: { filter, current, pageSize },
        })
    }

    componentDidMount() {
        const {
            alarm: { filter, pagination: { current, pageSize } },
            dispatch,
        } = this.props
        
        dispatch({
            type: 'alarm/fetchAlarm',
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
                <Radio.Button value={HANDLED}>以处理</Radio.Button>
            </Radio.Group>
        );
        return (
            <PageHeaderWrapper>
                <Card
                    title={formatMessage({ id: 'menu.alarm', defaultMessage: 'Region Alarm' })}
                    extra={extraContent}
                >
                    <Table
                        columns={columns}
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
