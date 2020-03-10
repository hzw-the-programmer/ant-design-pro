import { queryRTI, queryPlace } from '@/services/api';
import { queryPlaces, queryMap, queryPeople } from '@/services/sh';
import { IDAS_HTTP_API_ROOT } from '@/services/constants';

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

function convertPlace(place) {
  const newPlace = {
    label: place.name,
    value: place.id,
    children: [],
  };

  place.children.forEach(child => {
    newPlace.children.push(convertPlace(child));
  });

  return newPlace;
}

function convertMap(map) {
  const newMap = {
    url: IDAS_HTTP_API_ROOT + map.image,
    ratio: map.ratio,
  };

  return newMap;
}

function convertPerson(person) {
  const newPerson = {
    id: person.id,
    name: person.name,
  };

  return newPerson;
}

export default {
  namespace: 'monitor',

  state: {
    places: [],
    place: [],
    map: { url: '', ration: 0.0 },
    rti: { regions: [], people: [] },
    people: [],
    person: undefined,
    heatmap: false,
  },

  effects: {
    placesWatcher: [
      function*({ call, put }) {
        const response = yield call(queryPlaces);
        const places = convertPlace(response).children;
        yield put({
          type: 'savePlaces',
          payload: places,
        });
      },
      { type: 'watcher' },
    ],

    peopleWatcher: [
      function*({ call, put }) {
        try {
          const response = yield call(queryPeople);
          const people = [];
          response.result.forEach(person => {
            people.push(convertPerson(person));
          });
          yield put({
            type: 'savePeople',
            payload: people,
          });
        } catch (e) {
          console.log(e);
        }
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
      const map = convertMap(response.result[0]);
      yield put({
        type: 'saveMap',
        payload: map,
      });
    },

    *changePerson({ payload }, { put }) {
      yield put({
        type: 'savePerson',
        payload,
      });
    },

    *changeHeatmap({ payload }, { put }) {
      yield put({
        type: 'saveHeatmap',
        payload,
      });
    },

    rtiWatcher: [
      function*({ take, fork, call, cancel, put, select }) {
        function* rtiTask() {
          try {
            while (true) {
              yield call(delay, 1000);

              const place = yield select(state => state.monitor.place);
              const person = yield select(state => state.monitor.person);

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
                const map = yield select(state => state.monitor.map);
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
          yield take('monitor/startRTI');
          const task = yield fork(rtiTask);
          yield take('monitor/stopRTI');
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

    saveHeatmap(state, action) {
      return {
        ...state,
        heatmap: action.payload,
      };
    },
  },
};
