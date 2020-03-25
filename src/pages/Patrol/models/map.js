import { message } from 'antd'

import {
    queryPeople,
    queryPlaces,
    queryPatrolTimeRanges,
    queryPatrolLog,
    queryMap,
} from '@/services/sh'

import {
    convertPerson,
    convertPlace,
    findAncestors,
    getPlace,
    convertMap,
    combinePlaces,
} from '@/utils/sh'
  
export default {
    namespace: 'map',

    state: {
        people: [],
        places: [],
        pls: [],
        formFields: {},
        timeRanges: [],
        timeRange: undefined,
        place: [],
        map: { url: '', ratio: 0.0, extent: [0, 0, 0, 0] },
        patrolLogs: {},
        patrolLog: [],
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
                response.result.forEach(p => {
                    people.push(convertPerson(p))
                })
                yield put({
                    type: 'savePeople',
                    payload: people,
                })
            } catch (e) {
                console.log(e)
            }
        },

        *queryPlaces(_, { call, put }) {
            try {
                const response = yield call(queryPlaces)
                const places = convertPlace(response).children;
                yield put({
                    type: 'savePlaces',
                    payload: places,
                })
            } catch (e) {
                console.log(e)
            }
        },

        *queryPatrolTimeRanges({ payload }, { call, put }) {
            try {
                const response = yield call(queryPatrolTimeRanges, payload)
                if (response.code !== 0) {
                    message.error(response.msg)
                    return
                }
                const timeRanges = []
                response.result.forEach(tr => {
                    timeRanges.push({
                        id: tr.config_id,
                        timeRange: tr.time_range,
                    })
                })
                yield put({
                    type: 'saveTimeRanges',
                    payload: timeRanges,
                })
            } catch (e) {
                console.log(e)
            }
        },

        *changeTimeRange({ payload }, { call, put, select }) {
            try {
                const { date } = yield select(state => state.map.formFields)
                const response = yield call(queryPatrolLog, {id: payload, date})
                if (response.code !== 0) {
                    message.error(response.msg)
                    return
                }
                
                const places = yield select(state => state.map.places)
                const pls = []
                Object.keys(response.result.data).forEach(pid => {
                    pid = parseInt(pid, 10)
                    const pids = [];
                    findAncestors({ value: 0, children: places }, pid, pids);
                    pids.push(pid);
                    pids.shift();
    
                    pls.push(pids);
                })

                const rPlaces = [];
                pls.forEach(pl => {
                    places.forEach(p => {
                        const tp = getPlace(p, pl, 0);
                        if (tp) {
                            rPlaces.push(tp);
                        }
                    });
                });

                const fPlaces = combinePlaces(rPlaces)
                
                yield put({
                    type: 'saveTimeRange',
                    payload,
                })

                yield put({
                    type: 'savePls',
                    payload: fPlaces,
                })

                yield put({
                    type: 'savePatrolLogs',
                    payload: response.result.data,
                })

                yield put({
                    type: 'savePlace',
                    payload: [],
                })

                yield put({
                    type: 'saveMap',
                    payload: {url: '', ratio: 0.0, extent: [0, 0, 0, 0]},
                })
            } catch (e) {
                console.log(e)
            }
        },

        *changePlace({ payload }, { call, put, select }) {
            try {
                const response = yield call(queryMap, payload)
                if (response.code !== 0) {
                    message.error(response.msg)
                    return
                }
                if (response.result.length === 0) {
                    return
                }
                const map = convertMap(response.result[0])

                yield put({
                    type: 'savePlace',
                    payload,
                })

                yield put({
                    type: 'saveMap',
                    payload: map,
                })

                const patrolLogs = yield select(state => state.map.patrolLogs)
                yield put({
                    type: 'savePatrolLog',
                    payload: patrolLogs[payload[1]],
                })
            } catch(e) {
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
        savePlaces(state, { payload }) {
            return {
                ...state,
                places: payload,
            }
        },
        saveFormFields(state, { payload }) {
            return {
                ...state,
                formFields: payload,
            }
        },
        saveTimeRanges(state, { payload }) {
            return {
                ...state,
                timeRanges: payload,
            }
        },
        saveTimeRange(state, { payload }) {
            return {
                ...state,
                timeRange: payload,
            }
        },
        savePls(state, { payload }) {
            return {
                ...state,
                pls: payload,
            }
        },
        savePlace(state, { payload }) {
            return {
                ...state,
                place: payload,
            }
        },
        saveMap(state, { payload }) {
            return {
                ...state,
                map: payload,
            }
        },
        savePatrolLogs(state, { payload }) {
            return {
                ...state,
                patrolLogs: payload,
            }
        },
        savePatrolLog(state, { payload }) {
            return {
                ...state,
                patrolLog: payload,
            }
        },
    },

    subscriptions: {
        setup({ dispatch }) {
            dispatch({
                type: 'queryPeople',
            })
            dispatch({
                type: 'queryPlaces',
            })
        },
    },
}