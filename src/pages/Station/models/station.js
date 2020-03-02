import { queryStation } from '@/services/api';

export default {
  namespace: 'table',

  state: {
    stationlist: [],
  },

  effects: {
    peopleWatcher: [
      function*({ call, put }) {
        const response = yield call(queryStation);
        yield put({
          type: 'saveStation',
          payload: response,
        });
      },
      { type: 'watcher' },
    ],
  },

  reducers: {
    saveStation(state, { payload }) {
      return {
        ...state,
        stationlist: payload,
      };
    },
  },
};
