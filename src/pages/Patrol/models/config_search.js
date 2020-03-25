import { message } from 'antd';

import { queryPatrolConfigs } from '@/services/sh'

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout))

const DEFAULT_PAGESIZE = 10

export default {
    namespace: 'config_search',

    state: {
        fields: {},
        pagination: { current: 1, pageSize: DEFAULT_PAGESIZE, total: 0},
        data: [],
        loading: false,
    },

    effects: {
        *queryPatrolConfigs({ payload }, { call, put }) {
            try {
                yield put({
                    type: 'saveLoading',
                    payload: true,
                })
                
                // yield call(delay, 1000)
                
                const response = yield call(queryPatrolConfigs, payload)
                if (response.code !== 0) {
                    message.error(response.msg)
                    return
                }

                const fields = {...payload}
                delete fields.current
                delete fields.rows

                const pagination = {
                    current: payload.current,
                    pageSize: payload.pageSize,
                    total: response.result.total,
                }

                const data = []
                response.result.rows.forEach(r => {
                    data.push(r)
                })

                yield put({
                    type: 'saveConfigs',
                    payload: {fields, pagination, data}
                })
            } catch (e) {
                console.log(e)
            }
        },
    },

    reducers: {
        saveConfigs(state, { payload }) {
            return {
                ...state,
                ...payload,
                loading: false,
            }
        },

        saveLoading(state, { payload }) {
            return {
                ...state,
                loading: payload,
            }
        }
    },

    subscriptions: {
        setup({ dispatch }) {
            dispatch({
                type: 'queryPatrolConfigs',
                payload: {current: 1, pageSize: DEFAULT_PAGESIZE},
            })
        }
    }
}
