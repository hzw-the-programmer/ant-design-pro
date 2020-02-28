export default {
  namespace: 'route',

  state: {
    person: undefined,
    datetime: [],
  },

  effects: {
    *changePerson({ payload }, { put }) {
      yield put({
        type: 'savePerson',
        payload,
      });
    },

    *changeDatetime({ payload }, { put }) {
      yield put({
        type: 'saveDatetime',
        payload,
      });
    },
  },

  reducers: {
    savePerson(state, { payload }) {
      return {
        ...state,
        person: payload,
      };
    },

    saveDatetime(state, { payload }) {
      return {
        ...state,
        datetime: payload,
      };
    },
  },
};
