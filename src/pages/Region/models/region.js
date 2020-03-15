import { message } from 'antd'

import {
  queryPlaces,
  queryPlaceRegions,
  queryPlaceStations,
  queryMap,
  addStation,
  addRegion,
} from '@/services/sh'

import {
  convertPlace,
  getFirstPlace,
  convertRegions,
  convertStations,
  convertMap,
} from '@/utils/sh'

export default {
  namespace: 'region',

  state: {
    places: [],
    place: [],
    map: {url: '', ratio: 0.0, extent: [0, 0, 0, 0]},
    regions: [],
    stations: [],
  },

  effects: {
    *queryPlaces(_, { call, put }) {
      try {
        const response = yield call(queryPlaces);
        const places = convertPlace(response).children;
        yield put({
          type: 'savePlaces',
          payload: places,
        });

        const ids = [];
        getFirstPlace({ value: 0, children: places }, ids);
        ids.shift();
        yield put({
          type: 'changePlace',
          payload: ids,
        });
      } catch (e) {
        console.log(e)
      }
    },

    *changePlace({ payload }, { call, put }) {
      try {
        yield put({
          type: 'savePlace',
          payload,
        })

        let response = yield call(queryPlaceRegions, payload)
        const regions = convertRegions(response.result)

        response = yield call(queryPlaceStations, payload)
        const stations = convertStations(response.result)

        response = yield call(queryMap, payload)
        if (response.result.length === 0) {
          return;
        }
        const map = convertMap(response.result[0]);
        
        yield put({
          type: 'saveRegions',
          payload: regions,
        });

        yield put({
          type: 'saveStations',
          payload: stations,
        });

        yield put({
          type: 'saveMap',
          payload: map,
        });
      } catch(e) {
        console.log(e)
      }
    },

    *addAndQueryRegions({ payload }, { call }) {
      let response = yield call(addRegion, payload)
      if (response.code !== 0) {
        message.error(response.msg)
        return
      }
      
      response = yield call(queryPlaceRegions, payload.place)
      const stations = convertStations(response.result)

      yield put({
        type: 'saveStations',
        payload: stations,
      });
    }
  },

  reducers: {
    savePlaces(state, action) {
      return {
        ...state,
        places: action.payload,
      };
    },

    savePlace(state, action) {
      return {
        ...state,
        place: action.payload,
        map: {url: '', ratio: 0.0, extent: [0, 0, 0, 0]},
        regions: [],
        stations: [],
      }
    },

    saveMap(state, action) {
      return {
        ...state,
        map: action.payload,
      }
    },

    saveRegions(state, action) {
      return {
        ...state,
        regions: action.payload,
      }
    },

    saveStations(state, action) {
      return {
        ...state,
        stations: action.payload,
      }
    },
  },

  subscriptions: {
    setup({ dispatch }) {
      dispatch({
        type: 'queryPlaces',
      })
    },
  }
};
