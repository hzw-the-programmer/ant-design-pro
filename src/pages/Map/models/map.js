import { queryRTI, queryPlaces, queryMap } from '@/services/api';

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

export default {
  namespace: 'map',

  state: {
    rti: { regions: [], people: [] },
    places: [],
    map: { url: '', extent: [] },
  },

  effects: {
    *fetchPlaces(_, { call, put }) {
      const response = yield call(queryPlaces);
      yield put({
        type: 'savePlaces',
        payload: response,
      });
    },

    *fetchMap(action, { call, put }) {
      const response = yield call(queryMap, action.payload);
      yield put({
        type: 'saveMap',
        payload: response,
      });
    },

    *changePlace({ payload }, { call, put }) {
      yield put({
        type: 'stopRTI',
      });

      const response = yield call(queryMap, payload);
      yield put({
        type: 'saveMap',
        payload: response,
      });

      yield put({
        type: 'startRTI',
        payload,
      });
    },

    rtiWatcher: [
      function*({ take, fork, call, cancel, put }) {
        function* rtiTask(place) {
          try {
            while (true) {
              yield call(delay, 1000);
              const response = yield call(queryRTI, place);
              yield put({
                type: 'saveRTI',
                payload: response,
              });
              console.log('rtiTask');
            }
          } finally {
            console.log('rtiTask canceled');
          }
        }

        while (true) {
          const { payload } = yield take('startRTI');
          const task = yield fork(rtiTask, payload);
          yield take('stopRTI');
          yield cancel(task);
          console.log('after cancel');
        }
      },
      { type: 'watcher' },
    ],
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

    saveMap(state, action) {
      return {
        ...state,
        map: action.payload,
      };
    },
  },
};
