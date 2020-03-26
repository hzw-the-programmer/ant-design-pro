import { message } from 'antd'

import moment from 'moment'

import { queryAlarms, processAlarm } from '@/services/sh'

import { ALL, UNHANDLED, HANDLED } from '../constants'

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout))

export default {
    namespace: 'alarm',

    state: {
        filter: UNHANDLED,
        pagination: {
            current: 1,
            pageSize: 10,
            total: 12,
        },
        dataSource: [],
        loading: false,
    },

    effects: {
        fetchAlarms: [
            function*({ payload: { filter, current, pageSize} }, { call, put }) {
                try {
                    yield put({
                        type: 'saveLoading',
                        payload: true,
                    })
                    
                    const response = yield call(queryAlarms, {filter, current, pageSize})
                    if (response.code !== 0) {
                        message.error(response.msg)
                        return
                    }
                    const total = parseInt(response.result.total, 10)
                    const dataSource = []
                    response.result.rows.forEach(row => {
                        dataSource.push({
                            id: parseInt(row.id, 10),
                            number: parseInt(row.number, 10),
                            name: row.name,
                            region_name: row.region_name,
                            alarm_type: parseInt(row.alarm_type, 10),
                            timestamp: parseInt(row.time_stamp, 10),
                            handled: parseInt(row.handle, 10),
                        })
                    })
                    
                    yield put({
                        type: 'saveAlarm',
                        payload: {
                            filter,
                            pagination: { current, pageSize, total },
                            dataSource,
                            loading: false,
                        }
                    })
                } catch (e) {
                    console.log(e)
                }
            },
            {type: 'takeLatest'}
        ],

        *processAndFetchAlarms({ payload }, { call, put, select }) {
            try {
                const filter = yield select(state => state.alarm.filter)
                const { current, pageSize } = yield select(state => state.alarm.pagination)
                
                const response = yield call(processAlarm, payload)
                if (response.code !== 0) {
                    message.error(response.msg)
                    return
                }
                
                yield put({
                    type: 'fetchAlarms',
                    payload: { filter, current, pageSize },
                })
            } catch (e) {
                console.log(e)
            }
        }
    },

    reducers: {
        saveLoading(state, { payload }) {
            return {
                ...state,
                loading: payload,
            }
        },

        saveAlarm(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },
    }
}
