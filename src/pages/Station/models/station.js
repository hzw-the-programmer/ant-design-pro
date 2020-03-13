import { queryPlaces, queryMap } from '@/services/sh'
import { convertPlace, getFirstPlace, convertMap } from '@/utils/sh'

export default {
  namespace: 'station',

  state: {
    places: [],
    place: [],
    map: {url: '', ratio: 0.0, extent: [0, 0, 0, 0]}
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

        const response = yield call(queryMap, payload)
        if (response.result.length === 0) {
          return;
        }
        const map = convertMap(response.result[0]);
        yield put({
          type: 'saveMap',
          payload: map,
        });
      } catch(e) {
        console.log(e)
      }
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
      }
    },

    saveMap(state, action) {
      return {
        ...state,
        map: action.payload,
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
