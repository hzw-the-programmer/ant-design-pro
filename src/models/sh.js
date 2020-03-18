import { queryUnhandledAlarmsCount } from '@/services/sh'

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

export default {
    namespace: 'sh',

    state: {
        unhandledAlarmsCount: 0
    },

    effects: {
        watch: [
            function*({ call, put }) {
                while (true) {
                    try {
                        yield call(delay, 1000)
                        const response = yield call(queryUnhandledAlarmsCount)
                        yield put({
                            type: 'saveUnhandledAlarmsCount',
                            payload: response.result,
                        })
                    } catch (e) {
                        console.log(e)
                    }
                }
            },
            { type: 'watcher' }
        ]
    },

    reducers: {
        saveUnhandledAlarmsCount(state, { payload }) {
            return {
                ...state,
                unhandledAlarmsCount: payload,
            }
        }
    }
}
