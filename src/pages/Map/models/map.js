import { queryRegions } from '@/services/api';

export default {
  namespace: 'map',

  state: {
    regions: [],
  },

  effects: {
    *fetchRegions(_, { call, put }) {
      const response = yield call(queryRegions);
      yield put({
        type: 'saveRegions',
        payload: response,
      });
    },
  },

  reducers: {
    saveRegions(state, action) {
      return {
        ...state,
        regions: action.payload,
      };
    },
  },
};
