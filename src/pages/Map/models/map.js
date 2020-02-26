import { queryRTI, queryPlaces } from '@/services/api';

export default {
  namespace: 'map',

  state: {
    rti: { regions: [], people: [] },
    places: [],
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
      console.log(response);
      yield put({
        type: 'savePlaces',
        payload: response,
      });
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
  },
};
