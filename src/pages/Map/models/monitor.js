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
  convertPerson,
} from '@/utils/sh'

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

    selection: { rid: -1, pid: -1 },
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
          type: 'saveRtl',
          payload: {regions},
        })
        
        yield put({
          type: 'saveMap',
          payload: map,
        });

        yield put({
          type: 'rtlSub',
          payload,
        })
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

    *rtlMsg({ payload }, { put, select }) {
      try {
        // console.log('rtlMsg', payload);
        
        const regions = yield select(state => state.monitor.rtl.regions);
        const rs = []
        regions.forEach(r => {
          let nr = {...r, total: 0}
          payload.data2.rows.forEach(row => {
            if (r.id === parseInt(row.region_id, 10)) {
              nr = {...r, total: parseInt(row.number, 10)}
            }
          })
          rs.push(nr)
        })
        
        const convertP = p => {
          const id = parseInt(p.staff_id, 10)
          const name = p.name
          const workid = parseInt(p.number, 10)
          const time = p.time
          const region_name = p.region_name
          const team = p.team
          const status = parseInt(p.status, 10)
          const x = parseFloat(p.x)
          const y = parseFloat(p.y)
          let type
          if (p.position.localeCompare('医生')) {
            type = 1
          } else if (p.position.localeCompare('护士')) {
            type = 2
          } else if (p.position.localeCompare('病人')) {
            type = 3
          } else if (p.position.localeCompare('重症病人')) {
            type = 4
          } else if (p.position.localeCompare('保安')) {
            type = 5
          } else {
            type = 6
          }
          return {
            id,
            name,
            workid,
            time,
            region_name,
            team,
            status,
            extent: [x, y, 0, 0],
            type,
          }
        }
        const person = yield select(state => state.monitor.person);
        const people = []
        if (person) {
          for (let i = 0; i < payload.data1.length; i++) {
            const p = payload.data1[i]
            if (person === parseInt(p.staff_id, 10)) {
              people.push(convertP(p))
              
              const place = yield select(state => state.monitor.place);
              
              const places = yield select(state => state.monitor.places);
              const pid = parseInt(p.place_id, 10);
              const pids = [];
              findAncestors({ value: 0, children: places }, pid, pids);
              pids.push(pid);
              pids.shift();

              if (!isEqual(pids, place)) {
                yield put({
                  type: 'changePlace',
                  payload: pids,
                });
                return;
              }
            }
          }
        } else {
          payload.data.forEach(d => {
            people.push(convertP(d))
          })
        }

        const selection = yield select(state => state.monitor.selection)
        
        let region
        if (selection.rid !== -1) {
          let result = rs.filter(d => d.id === selection.rid)
          if (result.length !== 0) {
            region = {...result[0], people: []}
            result = payload.data.filter(d => parseInt(d.region_id, 10) === selection.rid)
            result.forEach(d => {
              region.people.push(convertP(d))
            })
          }
        }

        let sperson
        if (selection.pid !== -1) {
          let result = payload.data.filter(d => parseInt(d.staff_id, 10) === selection.pid)
          if (result.length !== 0) {
            sperson = convertP(result[0])
          }
        }

        yield put({
          type: 'saveRtl',
          payload: {
            regions: rs,
            people,
            total: payload.data2.total
          },
        })

        yield put({
          type: 'saveSelection',
          payload: { region, person: sperson },
        })
      } catch (e) {
        console.log(e);
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

    saveMap(state, action) {
      return {
        ...state,
        map: action.payload,
      };
    },

    saveRtl(state, action) {
      return {
        ...state,
        rtl: {...state.rtl, ...action.payload},
      };
    },

    saveHeatmap(state, action) {
      return {
        ...state,
        heatmap: action.payload,
      };
    },

    saveSelection(state, action) {
      return {
        ...state,
        selection: { ...state.selection, ...action.payload }
      }
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
