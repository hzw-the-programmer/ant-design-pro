import { MODIFY_REGION } from '../Map16';

export default {
  namespace: 'map16',
  state: {
    operation: MODIFY_REGION,
  },
  effects: {
    *changeOperation({ payload }, { put }) {
      yield put({
        type: 'saveOperation',
        payload,
      });
    },
  },
  reducers: {
    saveOperation(state, { payload }) {
      return {
        ...state,
        operation: payload,
      };
    },
  },
};
