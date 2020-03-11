import { isEqual } from 'lodash';

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
    id: parseInt(person.id, 10),
    name: person.name,
  };

  return newPerson;
}

function getFirstPlace(place, ids) {
  ids.push(place.value);
  if (place.children.length !== 0) {
    getFirstPlace(place.children[0], ids);
  }
}

function findAncestors(place, id, ids) {
  const r = place.children.filter(c => c.value === id);

  if (r.length !== 0) {
    ids.push(place.value);
    return true;
  }

  for (let i = 0; i < place.children.length; i += 1) {
    if (findAncestors(place.children[i], id, ids)) {
      ids.unshift(place.value);
      return true;
    }
  }

  return false;
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

        const ids = [];
        getFirstPlace({ value: 0, children: places }, ids);
        ids.shift();
        yield put({
          type: 'changePlace',
          payload: { place: ids, force: false },
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

    *changePlace({ payload }, { call, put, select }) {
      try {
        const { place, force } = payload;

        const person = yield select(state => state.monitor.person);
        if (person && !force) return;

        yield put({
          type: 'savePlace',
          payload: place,
        });

        yield put({
          type: 'clearMap',
        });

        yield put({
          type: 'clearRtl',
        });

        if (place.length === 0) {
          yield put({
            type: 'rtlSub',
            payload: [],
          });
          return;
        }

        const response = yield call(queryMap, place);
        if (response.result.length === 0) {
          return;
        }
        const map = convertMap(response.result[0]);
        yield put({
          type: 'saveMap',
          payload: map,
        });

        yield put({
          type: 'rtlSub',
          payload: place,
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
        const person = yield select(state => state.monitor.person);
        const place = yield select(state => state.monitor.place);
        const places = yield select(state => state.monitor.places);

        const convertP = p => {
          const newP = {
            id: parseInt(p.staff_id, 10),
            pos: {
              x: p.x * ratio,
              y: p.y * ratio,
            },
            visible: true,
          };

          return newP;
        };

        const regions = [];

        const people = [];
        if (person) {
          for (let i = 0; i < payload.data1.length; i += 1) {
            if (person === parseInt(payload.data1[i].staff_id, 10)) {
              const pid = parseInt(payload.data1[i].place_id, 10);
              const pids = [];
              findAncestors({ value: 0, children: places }, pid, pids);
              pids.push(pid);
              pids.shift();
              console.log(pids, place);

              if (!isEqual(pids, place)) {
                yield put({
                  type: 'changePlace',
                  payload: { place: pids, force: true },
                });
                return;
              }
            }
          }
        }

        payload.data.forEach(p => {
          const tp = convertP(p);
          if (person && tp.id !== person) {
            tp.visible = false;
          }
          people.push(tp);
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
