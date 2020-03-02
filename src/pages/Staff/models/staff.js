import { queryStaff } from '@/services/api';

export default {
  namespace: 'table',

  state: {
    stafflist: [],
  },

  effects: {
    peopleWatcher: [
      function*({ call, put }) {
        const response = yield call(queryStaff);
        yield put({
          type: 'saveStaff',
          payload: response,
        });
      },
      { type: 'watcher' },
    ],
  },

  reducers: {
    saveStaff(state, { payload }) {
      return {
        ...state,
        stafflist: payload,
      };
    },
  },
};
