import { message } from 'antd'

import {
    queryPeople
} from '@/services/sh'

import {
    convertPerson,
} from '@/utils/sh'

export default {
    namespace: 'patrol_log',

    state: {
        people: [],
        logs: [],
    },

    effects: {
        *queryPeople(_, { call, put }) {
            try {
                const response = yield call(queryPeople)
                if (response.code !== 0) {
                    message.error(response.msg)
                    return
                }
                
                const people = []
                response.result.forEach(r => {
                    people.push(convertPerson(r))
                })
                
                yield put({
                    type: 'savePeople',
                    payload: people,
                })
            } catch (e) {
                console.log(e)
            }
        },
    },

    reducers: {
        savePeople(state, { payload }) {
            return {
                ...state,
                people: payload,
            }
        },
    },

    subscriptions: {
        setup({ dispatch }) {
            dispatch({
                type: 'queryPeople',
            })
        },
    },
}
