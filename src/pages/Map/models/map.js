import { queryRTI } from '@/services/api';

export default {
  namespace: 'map',

  state: {
    rti: {},
  },

  effects: {
    *fetchRTI(_, { call, put }) {
      const response = yield call(queryRTI);
      yield put({
        type: 'saveRTI',
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
  },
};
