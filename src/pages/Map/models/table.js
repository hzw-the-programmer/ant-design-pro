import { queryPeople } from '@/services/api';

export default {
  namespace: 'table',

  state: {
    people: [],
  },

  effects: {
    peopleWatcher: [
      function*({ call, put }) {
        const response = yield call(queryPeople);
        yield put({
          type: 'savePeople',
          payload: response,
        });
      },
      { type: 'watcher' },
    ],
  },

  reducers: {
    savePeople(state, { payload }) {
      return {
        ...state,
        people: payload,
      };
    },
  },
};
