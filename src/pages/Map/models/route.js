import moment from 'moment';
import { isEqual } from 'lodash';

import { queryRoutes, queryMap } from '@/services/sh';
import { findAncestors, getPlace, getFirstPlace, convertMap } from '@/utils/sh';

function convertLocation(d) {
  const { x, y } = d;

  const l = {
    datetime: moment(d.time).unix(),
    duration: 0,
    coord: [x, y],
  };

  return l;
}

export default {
  namespace: 'route',

  state: {
    person: undefined,
    datetime: [],
    routes: [],
    places: [],
    place: [],
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

    *fetchRoutes(
      {
        payload: { person, datetime },
      },
      { call, select, put }
    ) {
      try {
        const places = yield select(state => state.monitor.places);

        const pls = [];
        const routes = [];

        const response = yield call(queryRoutes, person, datetime);
        response.result.forEach(r => {
          const pid = r.place_id;
          const pids = [];
          findAncestors({ value: 0, children: places }, pid, pids);
          pids.push(pid);
          pids.shift();

          pls.push(pids);

          const locations = [];
          r.data.forEach(d => {
            locations.push(convertLocation(d));
          });

          const route = {
            place: pids,
            map: { url: '', ratio: 0.0, extent: [] },
            locations,
          };

          routes.push(route);
        });

        yield put({
          type: 'saveRoutes',
          payload: routes,
        });

        // console.log(routes)

        const rPlaces = [];
        pls.forEach(pl => {
          places.forEach(p => {
            const tp = getPlace(p, pl, 0);
            if (tp) {
              rPlaces.push(tp);
            }
          });
        });

        // console.log(rPlaces);

        yield put({
          type: 'savePlaces',
          payload: rPlaces,
        });

        const rPlace = [];
        getFirstPlace({ value: 0, children: rPlaces }, rPlace);
        rPlace.shift();
        console.log(rPlace);

        yield put({
          type: 'changePlace',
          payload: rPlace,
        });
      } catch (e) {
        console.log(e);
      }
    },

    *changePlace({ payload }, { put, call }) {
      try {
        yield put({
          type: 'savePlace',
          payload,
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
          payload: {
            place: payload,
            map,
          },
        });
      } catch (e) {
        console.log(e);
      }
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

    saveRoutes(state, { payload }) {
      return {
        ...state,
        routes: payload,
      };
    },

    savePlaces(state, { payload }) {
      return {
        ...state,
        places: payload,
      };
    },

    savePlace(state, { payload }) {
      return {
        ...state,
        place: payload,
      };
    },

    saveMap(state, { payload }) {
      return {
        ...state,
        routes: state.routes.map(route => {
          if (isEqual(route.place, payload.place)) {
            return { ...route, map: { ...route.map, ...payload.map } };
          }

          return route;
        }),
      };
    },
  },
};
