import { queryRTI, queryPlaces, queryMap } from '@/services/api';

export default {
  namespace: 'map',

  state: {
    rti: { regions: [], people: [] },
    places: [],
    map: { url: '', extent: [] },
  },

  effects: {
    *fetchRTI(_, { call, put }) {
      const response = yield call(queryRTI);
      yield put({
        type: 'saveRTI',
        payload: response,
      });
    },

    *fetchPlaces(_, { call, put }) {
      const response = yield call(queryPlaces);
      yield put({
        type: 'savePlaces',
        payload: response,
      });
    },

    *fetchMap(action, { call, put }) {
      const response = yield call(queryMap, action.payload);
      yield put({
        type: 'saveMap',
        payload: response,
      });
    },

    *changePlace(action, { put }) {
      yield put({ type: 'fetchMap', payload: action.payload });
    },
  },

  reducers: {
    saveRTI(state, action) {
      return {
        ...state,
        rti: action.payload,
      };
    },

    savePlaces(state, action) {
      return {
        ...state,
        places: action.payload,
      };
    },

    saveMap(state, action) {
      return {
        ...state,
        map: action.payload,
      };
    },
  },
};
