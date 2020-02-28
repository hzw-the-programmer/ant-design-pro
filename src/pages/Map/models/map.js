import { queryRTI, queryPlaces, queryMap, queryPeople, queryPlace } from '@/services/api';

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

export default {
  namespace: 'map',

  state: {
    places: [],
    place: [],
    map: { url: '', extent: [] },
    rti: { regions: [], people: [] },
    people: [],
    person: undefined,
  },

  effects: {
    placesWatcher: [
      function*({ call, put }) {
        const response = yield call(queryPlaces);
        yield put({
          type: 'savePlaces',
          payload: response,
        });
      },
      { type: 'watcher' },
    ],

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

    *changePlace({ payload }, { call, put }) {
      yield put({
        type: 'savePlace',
        payload,
      });

      yield put({
        type: 'saveMap',
        payload: { url: '', extent: [] },
      });

      yield put({
        type: 'saveRTI',
        payload: { regions: [], people: [] },
      });

      const response = yield call(queryMap, payload);
      yield put({
        type: 'saveMap',
        payload: response,
      });
    },

    *changePerson({ payload }, { put }) {
      yield put({
        type: 'savePerson',
        payload,
      });
    },

    rtiWatcher: [
      function*({ take, fork, call, cancel, put, select }) {
        function* rtiTask() {
          try {
            while (true) {
              yield call(delay, 1000);

              const place = yield select(state => state.map.place);
              const person = yield select(state => state.map.person);

              let placeChanged = false;
              if (person !== undefined) {
                const p = yield call(queryPlace, person);
                if (place[0] !== p[0] || place[1] !== p[1]) {
                  yield put({
                    type: 'changePlace',
                    payload: p,
                  });
                  placeChanged = true;
                }
              }

              if (!placeChanged) {
                const map = yield select(state => state.map.map);
                if (map.url === '') {
                  console.log('rtiTask map.url is empty, continue.');
                } else {
                  const response = yield call(queryRTI, place, person);
                  yield put({
                    type: 'saveRTI',
                    payload: response,
                  });

                  console.log('rtiTask');
                }
              }
            }
          } finally {
            console.log('rtiTask cancelled');
          }
        }

        while (true) {
          yield take('startRTI');
          const task = yield fork(rtiTask);
          yield take('stopRTI');
          yield cancel(task);
          console.log('after cancel');
        }
      },
      { type: 'watcher' },
    ],
  },

  reducers: {
    savePlaces(state, action) {
      return {
        ...state,
        places: action.payload,
      };
    },

    savePlace(state, action) {
      return {
        ...state,
        place: action.payload,
      };
    },

    saveMap(state, action) {
      return {
        ...state,
        map: action.payload,
      };
    },

    saveRTI(state, action) {
      return {
        ...state,
        rti: action.payload,
      };
    },

    savePeople(state, action) {
      return {
        ...state,
        people: action.payload,
      };
    },

    savePerson(state, action) {
      return {
        ...state,
        person: action.payload,
      };
    },
  },
};
