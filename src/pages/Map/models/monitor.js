import { queryPlaces, queryMap, queryPeople, rtlWS } from '@/services/sh';
import { IDAS_HTTP_API_ROOT, LOCATION_WEBSOCKET_API_ROOT } from '@/services/constants';

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

const DEFAULT_MAP = { url: '', ratio: 0.0 };
const DEFAULT_RTL = { regions: [], people: [] };

export default {
  namespace: 'monitor',

  state: {
    places: [],
    people: [],
    place: [],
    person: null,
    map: DEFAULT_MAP,
    rtl: DEFAULT_RTL,
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
      try {
        yield put({
          type: 'savePlace',
          payload,
        });

        yield put({
          type: 'clearMap',
        });

        yield put({
          type: 'clearRtl',
        });

        if (payload.length === 0) {
          return;
        }

        const response = yield call(queryMap, payload);
        if (response.result.length === 0) {
          return;
        }
        const map = convertMap(response.result[0]);
        yield put({
          type: 'saveMap',
          payload: map,
        });
      } catch (e) {
        console.log(e);
      }
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

    *rtlMsg({ payload }, { put, select }) {
      console.log('rtlMsg');
      try {
        const ratio = yield select(state => state.monitor.map.ratio);

        const convertP = person => {
          const newPerson = {
            pos: {
              x: person.x * ratio,
              y: person.y * ratio,
            },
            visible: true,
          };

          return newPerson;
        };

        const regions = [];

        const people = [];
        payload.data.forEach(person => {
          people.push(convertP(person));
        });

        yield put({
          type: 'saveRtl',
          payload: {
            regions,
            people,
          },
        });
      } catch (e) {
        console.log(e);
      }
    },

    rtlSub({ payload }) {
      if (payload.length === 0) {
        rtlWS.send({
          type: 'record',
          place_id: 0,
          action: 0,
        });
      } else {
        rtlWS.send({
          type: 'record',
          place_id: payload[payload.length - 1],
          action: 1,
        });
      }
    },
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

    clearMap(state) {
      return {
        ...state,
        map: DEFAULT_MAP,
      };
    },

    saveRtl(state, action) {
      return {
        ...state,
        rtl: action.payload,
      };
    },

    clearRtl(state) {
      return {
        ...state,
        rtl: DEFAULT_RTL,
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

  subscriptions: {
    setup({ dispatch }) {
      rtlWS.open(LOCATION_WEBSOCKET_API_ROOT, dispatch);
    },
  },
};
