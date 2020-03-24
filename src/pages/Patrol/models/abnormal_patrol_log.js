import { queryAbnormalPatrolLog } from '@/services/sh'

const delay = t => new Promise(r => setTimeout(r, t))

export default {
    namespace: 'abnormal_patrol_log',

    state: {
        formValues: {},
        logs: [],
        loading: false,
        pagination: { current: 1, pageSize: 10, total: 0 }
    },

    effects: {
        *queryAbnormalPatrolLog({ payload }, { call, put }) {
            try {                
                yield put({
                    type: 'saveLoading',
                    payload: true,
                })

                // yield call(delay, 1000)
                const response = yield call(queryAbnormalPatrolLog, payload)
                
                if (response.code !== 0) {
                    message.error(response.msg)
                    yield put({
                        type: 'saveLoading',
                        payload: false,
                    })
                    return
                }

                yield put({
                    type: 'saveFormValues',
                    payload: payload,
                })

                yield put({
                    type: 'saveLogs',
                    payload: response.result,
                })

                yield put({
                    type: 'savePagination',
                    payload: {
                        current: payload.current,
                        pageSize: payload.pageSize,
                        total: response.result.length,
                    },
                })
                
                yield put({
                    type: 'saveLoading',
                    payload: false,
                })
            } catch (e) {
                console.log(e)
            }
        },
    },

    reducers: {
        saveFormValues(state, { payload }) {
            return {
                ...state,
                formValues: payload,
            }
        },
        saveLogs(state, { payload }) {
            return {
                ...state,
                logs: payload,
            }
        },
        saveLoading(state, { payload }) {
            return {
                ...state,
                loading: payload,
            }
        },
        savePagination(state, { payload }) {
            return {
                ...state,
                pagination: payload,
            }
        },
    }
}
