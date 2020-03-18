import moment from 'moment'

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
        fetchAlarm: [
            function*({ payload: { filter, current, pageSize} }, { call, put }) {
                try {
                    yield put({
                        type: 'saveLoading',
                        payload: true,
                    })
                    
                    yield call(delay, 1000)
                    
                    const total = dataSource.length
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
        ]
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

const dataSource = [
    {
        id: 1,
        staff_id: 1,
        name: '小问',
        region_name: '重症隔离区',
        alarm_type: 1,
        timestamp: moment().unix(),
    },
    {
        id: 2,
        staff_id: 1,
        name: '小问',
        region_name: '重症隔离区',
        alarm_type: 1,
        timestamp: moment().unix(),
    },
    {
        id: 3,
        staff_id: 1,
        name: '小问',
        region_name: '重症隔离区',
        alarm_type: 1,
        timestamp: moment().unix(),
    },
    {
        id: 4,
        staff_id: 1,
        name: '小问',
        region_name: '重症隔离区',
        alarm_type: 1,
        timestamp: moment().unix(),
    },
    {
        id: 5,
        staff_id: 1,
        name: '小问',
        region_name: '重症隔离区',
        alarm_type: 1,
        timestamp: moment().unix(),
    },
    {
        id: 6,
        staff_id: 1,
        name: '小问',
        region_name: '重症隔离区',
        alarm_type: 1,
        timestamp: moment().unix(),
    },
    {
        id: 7,
        staff_id: 1,
        name: '小问',
        region_name: '重症隔离区',
        alarm_type: 1,
        timestamp: moment().unix(),
    },
    {
        id: 8,
        staff_id: 1,
        name: '小问',
        region_name: '重症隔离区',
        alarm_type: 1,
        timestamp: moment().unix(),
    },
    {
        id: 9,
        staff_id: 1,
        name: '小问',
        region_name: '重症隔离区',
        alarm_type: 1,
        timestamp: moment().unix(),
    },
    {
        id: 10,
        staff_id: 1,
        name: '小问',
        region_name: '重症隔离区',
        alarm_type: 1,
        timestamp: moment().unix(),
    },
    {
        id: 11,
        staff_id: 1,
        name: '小问',
        region_name: '重症隔离区',
        alarm_type: 1,
        timestamp: moment().unix(),
    },
    {
        id: 12,
        staff_id: 1,
        name: '小问',
        region_name: '重症隔离区',
        alarm_type: 1,
        timestamp: moment().unix(),
    },
]
