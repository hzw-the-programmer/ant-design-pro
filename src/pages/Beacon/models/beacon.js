import { queryBeacon } from '@/services/api';

export default {
  namespace: 'table',

  state: {
    beaconlist: [],
  },

  effects: {
    peopleWatcher: [
      function*({ call, put }) {
        const response = yield call(queryBeacon);
        yield put({
          type: 'saveBeacon',
          payload: response,
        });
      },
      { type: 'watcher' },
    ],
  },

  reducers: {
    saveBeacon(state, { payload }) {
      return {
        ...state,
        beaconlist: payload,
      };
    },
  },
};
