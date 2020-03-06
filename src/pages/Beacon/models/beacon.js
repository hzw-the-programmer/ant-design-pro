import { queryBeacons } from '@/services/api';

export default {
  namespace: 'beacon',

  state: {
    beacons: [],
  },

  effects: {
    beaconsWatcher: [
      function*({ call, put }) {
        const response = yield call(queryBeacons, { page: 1, rows: 10 });
        yield put({
          type: 'saveBeacons',
          payload: response.result.rows,
        });
      },
      { type: 'watcher' },
    ],
  },

  reducers: {
    saveBeacons(state, { payload }) {
      return {
        ...state,
        beacons: payload,
      };
    },
  },
};
