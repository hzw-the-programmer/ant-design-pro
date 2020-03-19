import { isEqual } from 'lodash';

import {
  queryPlaces,
  queryMap,
  queryPeople,
  rtlWS,
  queryPlaceRegions
} from '@/services/sh';

import { IDAS_HTTP_API_ROOT, LOCATION_WEBSOCKET_API_ROOT } from '@/services/constants';

import {
  convertPlace,
  getFirstPlace,
  convertRegions,
  convertMap,
  findAncestors,
} from '@/utils/sh'

function convertPerson(person) {
  const newPerson = {
    id: parseInt(person.id, 10),
    name: person.name,
  };

  return newPerson;
}

export default {
  namespace: 'monitor',

  state: {
    places: [],
    place: [],

    people: [],
    person: null,
    
    map: { url: '', ratio: 0.0, extent: [0, 0, 0, 0] },
    rtl: { regions: [], people: [], total: 0},
    
    heatmap: false,
  },

  effects: {
    *queryPlacesAndChangePlace(_, { call, put }) {
      try {
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
          payload: ids,
        });
      } catch (e) {
        console.log(e)
      }
    },

    *queryPeople(_, { call, put }) {
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

    *changePlace({ payload }, { call, put, select }) {
      try {
        yield put({
          type: 'savePlace',
          payload,
        });

        let response = yield call(queryPlaceRegions, payload)
        const regions = convertRegions(response.result)
        regions.forEach(r => {
          r.total = 0
        })

        response = yield call(queryMap, payload);
        const map = convertMap(response.result[0]);

        yield put({
          type: 'saveRegions',
          payload: regions,
        })
        
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
      console.log('rtlMsg', payload);
      try {
        const ratio = yield select(state => state.monitor.map.ratio);
        const extent = yield select(state => state.monitor.map.extent);
        const person = yield select(state => state.monitor.person);
        const place = yield select(state => state.monitor.place);
        const places = yield select(state => state.monitor.places);

        const convertP = p => {
          const x = p.x * ratio;
          const y = extent[3] - p.y * ratio;
          const newP = {
            id: parseInt(p.staff_id, 10),
            pos: { x, y },
            visible: true,
          };

          return newP;
        };

        const convertRegion = r => {
          const x = r.pick1x * ratio;
          const y = extent[3] - r.pick1y * ratio;
          const w = (r.pick2x - r.pick1x) * ratio;
          const h = (r.pick2y - r.pick1y) * ratio;

          const nr = {
            name: r.region_name,
            rect: { x, y, w, h },
            total: r.number,
          };

          return nr;
        };

        const regions = [];
        payload.data2.rows.forEach(r => {
          regions.push(convertRegion(r));
        });

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
        map: { url: '', ratio: 0.0, extent: [0, 0, 0, 0] },
        rtl: { regions: [], people: [], total: 0 },
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

    saveRegions(state, action) {
      return {
        ...state,
        rtl: { ...state.rtl, regions: action.payload },
      };
    },

    saveMap(state, action) {
      return {
        ...state,
        map: action.payload,
      };
    },

    saveRtl(state, action) {
      return {
        ...state,
        rtl: action.payload,
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

      dispatch({
        type: 'queryPlacesAndChangePlace',
      })
      
      dispatch({
        type: 'queryPeople',
      })
    },
  },
};
